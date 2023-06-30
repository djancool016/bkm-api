const {DateFormat} = require('../utils/dateFormat')
const {StatusLogger, DataLogger} = require('../utils/logger')

class LoanPayment {
    constructor({
        loan = {id, total_loan, percent_interest, percent_bop, loan_duration, loan_start}, 
        transactions = [{id_type, total, trans_date}],
        requestBody = {end_date}
    }){
        this.loan = loan
        this.transactions = transactions
        this.requestBody = requestBody
    }
    // create upaid monthly loan payments
    get #createPayments(){

        const {
            id:id_loan, total_loan, percent_interest = 1.45, 
            percent_bop = 0.05, loan_duration, loan_start
        } = this.loan

        // calculate yearly interest and bop
        const total_interest = calculatePercentage(total_loan, percent_interest, loan_duration)
        const total_bop = calculatePercentage(total_loan, percent_bop, loan_duration)

        // calculate monthly loan
        let {monthly_payment: monthly_loan, last_month_payment: last_month_loan} =
        calculateMonthlyPayments(total_loan, loan_duration)

        // calculate monthly interest
        let {monthly_payment: monthly_interest, last_month_payment: last_month_interest} =
        calculateMonthlyPayments(total_interest, loan_duration)

        // calculate monthly bop
        let {monthly_payment: monthly_bop, last_month_payment: last_month_bop} =
        calculateMonthlyPayments(total_bop, loan_duration)

        const payments = []
            
        // generate monthly payments
        for(let no = 1; no <= loan_duration; no++){
    
            let due_date = new DateFormat(loan_start)
            due_date.addMonths = no
            due_date = due_date.toISOString(false)
            
            if(no === loan_duration){
                monthly_loan = last_month_loan
                monthly_interest= last_month_interest
                monthly_bop = last_month_bop
            }

            payments.push({
                id_loan,
                payment_no: no,
                due_date,
                monthly_loan,
                monthly_loan_remaining: monthly_loan,
                monthly_interest,
                monthly_interest_remaining: monthly_interest,
                monthly_bop,
                monthly_bop_remaining: monthly_bop,
                is_settled: false
            })
        }
        return payments
    }
    // fill loan payments with transaction data
    get generate(){

        const loanPayment = this.#createPayments

        let paid_loan = 0
        let paid_interest = 0
        let paid_bop = 0

        this.transactions.forEach(transaction => {

            let{id_type, total} = transaction

            switch(id_type){
                case 4,39: // Loan Payment
                    paid_loan += total
                    break
                case 5,40: // Interest Payment
                    paid_interest += total
                    break
                case 6,41: // BOP Payment
                    paid_bop += total
                    break
                default:
                    return new StatusLogger({code: 404, message:'Invalid type transaction'}).log 
            }
        })
        // reduce monthly payment with transaction data
        loanPayment.reduce((acc, obj) => {
            if(paid_loan > 0){
                const reduction = Math.min(obj.monthly_loan_remaining, paid_loan)
                obj.monthly_loan_remaining -= reduction
                paid_loan -= reduction
            }
            if(paid_interest > 0){
                const reduction = Math.min(obj.monthly_interest_remaining, paid_interest)
                obj.monthly_interest_remaining -= reduction
                paid_interest -= reduction
            }
            if(paid_bop > 0){
                const reduction = Math.min(obj.monthly_bop_remaining, paid_bop)
                obj.monthly_bop_remaining -= reduction
                paid_bop -= reduction
            }
            const isSettled = obj.monthly_loan_remaining + obj.monthly_interest_remaining + obj.monthly_bop_remaining
            if (isSettled === 0) obj.is_settled = true

            acc.push(obj)
            return acc
        }, [])

        // create collectibility object
        const collectibility = new Collectibility({
            loanPayment,
            endDate: this.requestBody.end_date
        })

        const dataTransaction = this.transactions.filter(transaction => transaction.total > 0)

        return {
            loan: this.loan,
            transactions: dataTransaction,
            loanPayment,
            paymentRemaining: paymentRemaining(loanPayment),
            paymentPaid: paymentPaid(loanPayment),
            collectibility: collectibility.generate
        }
    }
}

class Collectibility {
    constructor({
        loanPayment,
        endDate,
        ignoreDate = true
    }){
        this.loanPayment = loanPayment
        this.endDate = new DateFormat(endDate)
        this.ignoreDate = ignoreDate
        this.collectibility = {
            current: 0,
            deliquent: 0,
            doubtful: 0,
            nonperforming: 0,
            default: 0
        }
    }
    get generate(){

        // fill loanPayment with transaction data
        this.loanPayment.forEach(obj => {
                
            let {due_date, monthly_loan_remaining} = obj

            // gap days between transaction date and due date
            let diffDays = this.endDate? this.endDate.diffDays(due_date) : 1 
            
            // set due date and transaction date to 1, can be turn off from class parameter
            if(this.ignoreDate){
                let parts = due_date.split('-')
                let newDueDate = `${parts[0]}-${parts[1].padStart(2,'0')}-01`
                diffDays = this.endDate? this.endDate.diffDays(newDueDate) : 1
            }

            // default (more than 360 days)
            if(diffDays < -360 || this.collectibility.default > 0){
                this.collectibility.default += monthly_loan_remaining
            }
            // non-performing (day 180 - 360)
            else if(diffDays < -180 || this.collectibility.nonperforming > 0){
                this.collectibility.nonperforming += monthly_loan_remaining
            }
            // doubtful (day 90 - 180)
            else if(diffDays < -90 || this.collectibility.doubtful > 0){
                this.collectibility.doubtful += monthly_loan_remaining
            }
            // deliquent (day 0 - 90)
            else if(diffDays <= 0 || this.collectibility.deliquent > 0){
                this.collectibility.deliquent += monthly_loan_remaining
            }
            // current 
            else {
                this.collectibility.current += monthly_loan_remaining
            }
        })
        return this.collectibility
    }
}

class LoanPaymentFactory {
    async read({loan, transactionLoan, requestBody}){

        if(loan.status == false) return loan
        if(transactionLoan.status == false) {
            const id_type = [4,5,6]
            transactionLoan.data = []
            id_type.forEach(id => {
                transactionLoan.data.push({transaction: {
                    id_type: id,
                    trans_date: null,
                    total: 0
                }})
            })
        }

        const transactions = transactionLoan.data.map(obj => obj.transaction)
        const loanPayment = new LoanPayment({
            loan: loan.data, 
            transactions,
            requestBody
        })

        return new DataLogger({data: loanPayment.generate}).log
    }
}


// Calculate montly payment 
function calculateMonthlyPayments(total_payments, duration_payments){

    let monthly_payment = Math.ceil(total_payments/duration_payments/100) * 100
    let last_month_payment = total_payments - (monthly_payment*(duration_payments - 1))
    return {monthly_payment, last_month_payment}
}

// calculate the yearly total percentage
function calculatePercentage(total, percent, duration){
    
    let monthly_interest = total * percent / 100
    // rounded up to 100
    let rounded_interest = Math.ceil(monthly_interest / 100) * 100
    return rounded_interest * duration
}
// calculate remaining payment
function paymentRemaining(loanPayment){
    
    return loanPayment.reduce((acc, payment) => {
        acc.remaining_loan += payment.monthly_loan_remaining
        acc.remaining_interest += payment.monthly_interest_remaining
        acc.remaining_bop += payment.monthly_bop_remaining
        return acc
    }, {
        remaining_loan: 0,
        remaining_interest: 0,
        remaining_bop: 0
    }) 
}
// calculate paid payment
function paymentPaid(loanPayment){
    
    return loanPayment.reduce((acc, payment) => {
        acc.paid_loan += payment.monthly_loan - payment.monthly_loan_remaining
        acc.paid_interest += payment.monthly_interest - payment.monthly_interest_remaining
        acc.paid_bop += payment.monthly_bop - payment.monthly_bop_remaining
        return acc
    }, {
        paid_loan: 0,
        paid_interest: 0,
        paid_bop: 0
    }) 
}

module.exports = { LoanPaymentFactory, LoanPayment }