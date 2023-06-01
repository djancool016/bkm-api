const {BaseModel} = require('./base-factory')
const {LoanFactory} = require('./loan-factory')
const {StatusLogger, DateFormat, DataLogger} = require('../utils')
const model = require('../models')

class LoanPaymentModel extends BaseModel {
    constructor(){
        super()
        this.model = model.LoanPayment
        this.query.where = {}
    }
    findLatestOne(is_settled){
        this.query.order = [['created_at','DESC']]
        this.isSettled(is_settled)
        return this.findOne()
    }
    findByIdLoan(id_loan, is_settled){
        this.query.where = {id_loan}
        this.isSettled(is_settled)
        return this.findAll()
    }
    findByKsmId(id_ksm, is_settled){
        this.query.where = {'$loan.ksm.id$': id_ksm}
        this.isSettled(is_settled)
        return this.findAll()
    }
    deleteByIdLoan(id_loan){
        return this.bulkDelete({where: {id_loan: id_loan}})
    }
    findByIds(ids, is_settled){
        this.query.where = {id: ids}
        this.isSettled(is_settled)
        return this.findAll()
    }
    isSettled(is_settled){
        if(is_settled || is_settled === false) return this.query.where.is_settled = is_settled
    }
}

class LoanPaymentFactory {
    constructor(){
        this.model = new LoanPaymentModel()
        this.loan = new LoanFactory()
    }
    async create({id_loan}){

        // Loan Validator
        let loan = await this.loan.read({id: id_loan})
        if(loan.status == false) return loan
        if(loan.data?.is_finish == 1) return new StatusLogger({code: 400, message: 'Loan is already finish'}).log

        // Loan Payment Validator
        let {status} = await this.read({id_loan: id_loan})
        if(status) return new StatusLogger({code: 400, message: 'Loan Payments is already created'}).log

        // calculate monthly payment
        let {total_loan, total_interest, loan_duration, loan_start} = loan.data
        let {loan_remaining, interest_remaining, last_loan, last_interest} = calculateLoanPayment({total_loan, total_interest, loan_duration})
        
        // build array of payments
        let payments = []
        for(let no = 1; no <= loan_duration; no++){

            let due_date = new DateFormat(loan_start)
            due_date.addMonths = no
            due_date = due_date.toISOString(false)

            if(no === loan_duration){
                loan_remaining = last_loan
                interest_remaining = last_interest
            }
            payments.push({
                id_loan,
                payment_no: no,
                due_date,
                loan_full: loan_remaining,
                loan_remaining,
                interest_full: interest_remaining,
                interest_remaining,
            })
        }
        return await this.model.bulkCreate(payments)
    }

    async bulkCreate({approvedIds, loans}){

        let approved = []

        for(let i = 0; i < approvedIds.length; i++){
            let loanPayment = await this.create({id_loan: approvedIds[i]})
            if(loanPayment.status) approved.push(loans.find(loan => loan.id == approvedIds[i]))
        }

        if(approved.length > 0) {
            return new DataLogger({data: approved, message:`Successfully approve ${approved.length} loans`}).log 
        }
        return new StatusLogger({code: 400, message:'Loans approval failed'}).log
    }

    async read({id, id_loan, id_ksm, ids = [], is_settled}){

        if(id){
            return await this.model.findByPk(id)
        }
        else if(id_loan){
            return await this.model.findByIdLoan(id_loan, is_settled)
        }
        else if(id_ksm){
            return await this.model.findByKsmId(id_ksm, is_settled)
        }
        else if(ids.length > 0){
            return await this.model.findByIds(ids, is_settled)
        }
        else {
            return new StatusLogger({code: 404, message:'Loan Payment not found'}).log
        }
    }

    async delete({id_loan}){

        // validate loan
        let {status, data} = await this.model.findByIdLoan(id_loan)
        if(status === false) return new StatusLogger({code: 404, message: 'Loan data not found'}).log
        
        // validate loan progression
        if(isInProgress(data)) return StatusLogger({code: 400, message: 'Loan Payment is already in progress'})

        return await this.model.deleteByIdLoan(id_loan)
    }

    async updatePayment({payments, loan, transaction}){

        if(!payments || !loan || !transaction) return new StatusLogger({code: 400, message:'Update Payment Failed'}).log

        let {total: total_payment, id_coa} = transaction
        let {id: id_loan} = loan
        let currentPayment

        for(let i = 0; i < payments.length; i++) {
            
            if(total_payment === 0) break

            // get id and lan_remaining for each payment
            let { id, loan_remaining, interest_remaining } = payments[i]
            let payment = {loan_remaining, interest_remaining}
            let installments_remaining

            switch (id_coa) {
                case 16 :
                    installments_remaining = loan_remaining - total_payment
                    currentPayment = paymentRemaining(installments_remaining, payment)
                    payment.loan_remaining = currentPayment.remaining
                    total_payment = currentPayment.total_payment
                    break
                case 17:
                    installments_remaining = interest_remaining - total_payment
                    currentPayment = paymentRemaining(installments_remaining, payment)
                    payment.interest_remaining = currentPayment.remaining
                    total_payment = currentPayment.total_payment
                    break
                default:
                    return new StatusLogger({code: 500, message:'invalid type payment'}).log
            }

            if(payment.loan_remaining == 0 && payment.interest_remaining == 0){
                payment.is_settled = true
            }

            let update = await this.model.update(payment, id)
           
            if(update.status == false){
                new StatusLogger({code: 500, message: 'Update payment failed'}).log
            }

            if(i == (payments.length - 1) && payment.is_settled){
                let payOff = await this.loan.paidOff({id: id_loan})
                if(payOff.status) return new StatusLogger('Successfully pay off all loan payments')
            }
        }
        return new StatusLogger({code: 200, message:'Successfully update payment'}).log
    }
}

function isInProgress(payments){
    payments.map(obj => {
        let full = obj["loan_full"] + obj['interest_full']
        let remaining = obj["loan_remaining"] + obj['interest_remaining']
        return full == remaining
    })
    .filter( obj => obj == false)

    return payments.length != 0
}
function calculateLoanPayment({total_loan, total_interest, loan_duration}){

    let loan_remaining = Math.ceil(total_loan/loan_duration/100)*100
    let interest_remaining = Math.ceil(total_interest/loan_duration/100)*100

    let last_loan = total_loan-(loan_remaining*(loan_duration-1))
    let last_interest = total_interest-(interest_remaining*(loan_duration-1))

    return {loan_remaining, interest_remaining, last_loan, last_interest}
}
function paymentRemaining(installments_remaining, payment = {}){
    if (installments_remaining < 0){
        // this is for  installments paid off, the remaining payment is forwarded to the next installments
        payment.remaining = 0           
        payment.total_payment = Math.abs(installments_remaining)
        
    } else {
        // this is for remaining unpaid installments
        payment.remaining = installments_remaining
        payment.total_payment = 0
    }
    return payment
}

module.exports = { LoanPaymentFactory }