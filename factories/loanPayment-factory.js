const {BaseModel} = require('./base-factory')
const {LoanFactory} = require('./loan-factory')
const {StatusLogger, DateFormat, DataLogger} = require('../utils')
const {Op} = require('sequelize')
const model = require('../models')

class LoanPaymentModel extends BaseModel {
    constructor(){
        super()
        this.model = model.LoanPayment
        this.model.include = [
            {
                model: model.Loan,
                as: 'loan',
                attributes: ['id', 'loan_duration', 'loan_interest','is_valid','is_finish'],
                include: [
                    {
                        model: model.Ksm,
                        as: 'ksm',
                        attributes: ['id', 'id_lkm','name']

                    }
                ]
            }
        ]
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
    findByIdLoan(id_loan, is_settled){
        this.query.where = {id_loan}
        if(is_settled != undefined || is_settled != null) this.query.where.is_settled = is_settled
        return this.findAll()
    }
    findByKsmId(id_ksm, is_settled){
        this.query.where = {'$loan.ksm.id$': id_ksm}
        if(is_settled) this.query.where.is_settled = is_settled
        return this.findAll()
    }
    deleteByIdLoan(id_loan){
        return this.bulkDelete({where: {id_loan: id_loan}})
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
        if(loan.data.is_finish == 1) return new StatusLogger({code: 400, message: 'Loan is already finish'}).log
        if(loan.status == false) return loan

        // Loan Payment Validator
        let {status} = await this.read({id_loan: id_loan})
        if(status) return new StatusLogger({code: 400, message: 'Loan Payments already created'}).log

        
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

    async read({id, id_loan, id_ksm}){

        if(id){
            return await this.model.findByPk(id)
        }else if(id_loan){
            return await this.model.findByIdLoan(id_loan)
        }else if(id_ksm){
            return await this.model.findByKsmId(id_ksm)
        }else {
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

    async payment({id_loan, pay_loan, pay_interest}){

        // validate input
        if(!id_loan && (!loan_payment || !interest_payment)) return new StatusLogger({code: 400}).log

        // validate loan
        let {status, data} = await this.model.findByIdLoan(id_loan, false)
        if(status === false) return new StatusLogger({code: 404, message: 'Loan data not found'}).log
        if(data.length == 0) return new StatusLogger({code: 200, message: 'Loan is already finished'}).log

        // pay loan
        if(pay_loan > 0){
            let loanPayment = await this.payLoan({data, total_payment: pay_loan})
            if(loanPayment.status == false) return loanPayment
        }

        // pay interest
        if(pay_interest > 0){
            let interestPayment = await this.payInterest({data, total_payment: pay_interest})
            if(interestPayment.status == false) return interestPayment
        }

        // finish the loan if all payments is settled
        return await this.paidOffLoan({id_loan})
    }

    async payLoan({data, total_payment}){
        
        for(let i = 0; i < data.length; i++) {

            if(total_payment === 0) break

            // get id and lan_remaining for each payment
            let { id, loan_remaining, interest_remaining } = data[i]
            let installments_remaining = loan_remaining - total_payment
            let payment = {loan_remaining, interest_remaining}

            if (installments_remaining < 0){
                // this is for  installments paid off, the remaining payment is forwarded to the next installments
                payment.loan_remaining = 0           
                total_payment = Math.abs(installments_remaining)
                
            } else if (installments_remaining > 0){
                // this is for remaining unpaid installments
                payment.loan_remaining = installments_remaining
                total_payment = 0
                
            } else if (installments_remaining === 0){
                // this is for  installments paid off
                payment.loan_remaining = installments_remaining
                total_payment = 0
            } 

            if(payment.loan_remaining == 0 && payment.interest_remaining == 0) payment.is_settled = true
            let {status} = await this.model.update(payment, id)
            if(status == false) new StatusLogger({code: 500, message: 'Update Loan Payment Failed'}).log
        }
        return new StatusLogger({code: 200}).log
    }
    async payInterest({data, total_payment}){
        
        for(let i = 0; i < data.length; i++) {

            if(total_payment === 0) break

            // get id and lan_remaining for each payment
            let { id, loan_remaining, interest_remaining } = data[i]
            let installments_remaining = interest_remaining - total_payment
            let payment = {loan_remaining, interest_remaining}

            if (installments_remaining < 0){
                // this is for  installments paid off, the remaining payment is forwarded to the next installments
                payment.interest_remaining = 0           
                total_payment = Math.abs(installments_remaining)
                
            } else if (installments_remaining > 0){
                // this is for remaining unpaid installments
                payment.interest_remaining = installments_remaining
                total_payment = 0
                
            } else if (installments_remaining === 0){
                // this is for  installments paid off
                payment.interest_remaining = installments_remaining
                total_payment = 0
            } 

            if(payment.loan_remaining == 0 && payment.interest_remaining == 0) payment.is_settled = true
            let {status} = await this.model.update(payment, id)
            if(status == false) new StatusLogger({code: 500, message: 'Update Interest Payment Failed'}).log
        }
        return new StatusLogger({code: 200}).log
    }
    async paidOffLoan({id_loan}){

        let {status, data} = await this.model.findByIdLoan(id_loan, false)
        if(status === false) return new StatusLogger({code: 404, message: 'Loan data not found'}).log

        if(data.length == 0) return await this.loan.paidOff({id_loan})
        return new StatusLogger({code: 200, message:`There is still ${data.length} payments to go`}).log
    }
    async getTotalRemaining({id_loan}){

        let loanPayment = await this.read({id_loan})
        let {data, status} = loanPayment
        if(status == false) return loanPayment

        let remainingLoan = data
            .map(obj => obj['loan_remaining'])
            .reduce((acc, val) => acc + val, 0)

        let remainingInterests = data
            .map(obj => obj['interest_remaining'])
            .reduce((acc, val) => acc + val, 0)
        
        return new DataLogger({data: {remainingLoan, remainingInterests}}).log
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

module.exports = { LoanPaymentFactory }