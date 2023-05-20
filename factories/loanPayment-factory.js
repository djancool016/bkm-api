const {BaseModel} = require('./base-factory')
const {LoanFactory} = require('./loan-factory')
const {StatusLogger, DateFormat, DataLogger} = require('../utils')
const {Op} = require('sequelize')
const model = require('../models')

class LoanPaymentModel extends BaseModel {
    constructor(){
        super()
        this.model = model.LoanPayment
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
}

class LoanPaymentFactory {
    constructor(){
        this.model = new LoanPaymentModel()
        this.loan = new LoanFactory()
    }
    async create(id_loan){

        let loan = await this.loan.read({id: id_loan})
        if(loan.status == false) return loan
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
}

function calculateLoanPayment({total_loan, total_interest, loan_duration}){

    let loan_remaining = Math.ceil(total_loan/loan_duration/100)*100
    let interest_remaining = Math.ceil(total_interest/loan_duration/100)*100

    let last_loan = total_loan-(loan_remaining*(loan_duration-1))
    let last_interest = total_interest-(interest_remaining*(loan_duration-1))

    return {loan_remaining, interest_remaining, last_loan, last_interest}
}

module.exports = { LoanPaymentFactory }