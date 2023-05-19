const {BaseModel} = require('./base-factory')
const {KsmFactory} = require('./ksm-factory')
const {StatusLogger, DateFormat, DataLogger} = require('../utils')
const {Op} = require('sequelize')
const model = require('../models')

class LoanModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Loan
        this.query.include = [
            {
                model: model.Ksm,
                as: 'ksm',
                attributes: ['id', 'name']
            }
        ]
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
    findByKsmName(ksm_name){
        this.query.where = {'$ksm.name$': {[Op.like]: `%${ksm_name}%`}}
        return this.findAll()
    }
}

class LoanFactory {
    constructor(){
        this.model = new LoanModel()
        this.ksm = new KsmFactory()
    }

    async create({id_ksm, total_loan, loan_duration, loan_interest, loan_start}){

        if(!id_ksm || !total_loan || !loan_duration || !loan_interest || !loan_start){
            return new StatusLogger({code: 400}).log
        }

        // validate ksm
        let{data} = this.ksm.read({id_ksm: id_ksm})
        if(!data) return new StatusLogger({code: 404, message: "Ksm not found"})

        // build loan object
        let total_interest = calculateInterest(total_loan, loan_interest,loan_duration)
        let loan = {
            id_ksm,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }

        return await this.model.create(loan)
    }

    async read({id, ksm_name, findLatest = false}){
        if(id){
            return await this.model.findByPk(id)
        }else if(ksm_name){
            return await this.model.findByKsmName(ksm_name)
        }else if(findLatest){
            return await this.model.findLatestOne()
        }else {
            return await this.model.findAll()
        }
    }

    async update({id, id_ksm, total_loan, loan_duration, loan_interest}){

        let validator = loanValidator(this.model, id)
        if(validator.status == false) return validator

        let total_interest = calculateInterest(total_loan, loan_interest,loan_duration)
        let loan = {
            id_ksm,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }

        return await this.model.update(loan, id)
    }

    async validateLoan(id, start_date = new Date()){

        let validator = loanValidator(this.model, id)
        if(validator.status == false) return validator

        let {loan_duration} = validator.data
        let {loan_start, loan_end} = calculateDuration(start_date, loan_duration)

        let loan = {
            loan_start,
            loan_end,
            is_valid: true
        }
        return await this.model.update(loan, id)
    }
    
    async paidOff(id){

        let validator = loanValidator(this.model, id)
        if(validator.status == false) return validator

        let loan = {
            is_finish: true
        }
        return await this.model.update(loan, id)
    }

    async delete(id){

        let validator = loanValidator(this.model, id)
        if(validator.status == false) return validator

        return await this.model.delete(id)
    }
}

function calculateDuration(loan_start, loan_duration){
    loan_start = new DateFormat(loan_start).toISOString(false)
    let loan_end = new DateFormat(loan_start)
    loan_end.addMonths = loan_duration
    loan_end.toISOString(false)

    return {loan_start, loan_end}
}

function calculateInterest(total_loan, loan_interest, loan_duration){
    let monthly_interest = total_loan * loan_interest / 100
    return monthly_interest * loan_duration
}

function loanValidator(model, id){
    let {data, status} = model.read(id)

    if(status == false) {
        return new StatusLogger({code: 404, message: 'Loan not found'})
    }
    if(data?.is_valid || data?.is_finish) {
        return new StatusLogger({code: 400, message: 'Loan is in progress or already finish'})
    }
    return new DataLogger({data})
}

module.exports = { LoanFactory }