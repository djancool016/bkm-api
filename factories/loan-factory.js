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
    findByKsmId(id_ksm){
        this.query.where = {id_ksm: id_ksm}
        return this.findAll()
    }
}

class LoanFactory {
    constructor(){
        this.model = new LoanModel()
        this.ksm = new KsmFactory()
    }

    async create({id_ksm, total_loan, loan_duration, loan_interest}){

        if(!id_ksm || !total_loan || !loan_duration || !loan_interest){
            return new StatusLogger({code: 400}).log
        }

        // validate ksm
        let {status} = await this.ksm.read({id: id_ksm})
        if(status == false) return new StatusLogger({code: 404, message: "Ksm not found"}).log

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

    async read({id, id_loan, id_ksm, ksm_name, findLatest = false}){

        if(id || id_loan){
            return await this.model.findByPk(id = id || id_loan)
        }else if(ksm_name){
            return await this.model.findByKsmName(ksm_name)
        }else if(id_ksm){
            return await this.model.findByKsmId(id_ksm)
        }else if(findLatest){
            return await this.model.findLatestOne()
        }else {
            return new StatusLogger({code: 404, message:'Loan not found'}).log
        }
    }

    async update({id, id_ksm, total_loan, loan_duration, loan_interest}){

        // validate loan
        let validator = await loanValidator(await this.read({id: id}))
        if(validator.status == false) return validator

        let total_interest
        if(total_loan){
            loan_duration = loan_duration? loan_duration : validator?.data?.loan_duration
            loan_interest = loan_interest? loan_interest : validator?.data?.loan_interest
            if(!loan_duration || !loan_interest) return new StatusLogger({code: 400}).log
            total_interest = calculateInterest(total_loan, loan_interest, loan_duration)
        }
        
        let loan = {
            id_ksm,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }

        return await this.model.update(loan, id)
    }

    async loanApproval({id_loan, start_date = new Date()}){

        // validate loan
        let validator = await loanValidator(await this.read({id: id_loan}))
        if(validator.status == false) return validator

        let {loan_duration} = validator.data
        let {loan_start, loan_end} = calculateDuration(start_date, loan_duration)

        let loan = {
            loan_start,
            loan_end,
            is_valid: true
        }
        return await this.model.update(loan, id_loan)
    }
    
    async paidOff({id}){

        // validate loan
        let validator = await loanValidator(await this.read({id: id}), true)
        if(validator.status == false) return validator

        let {ksm:{name},is_valid, is_finish} = validator.data
        
        if(is_valid == false){
            return new StatusLogger({code: 400, message: 'Loan is in approval proccess'}).log
        }
        else if(is_finish){
            return new StatusLogger({code: 400, message: 'Loan is already finish'}).log
        }

        let loan = {
            is_finish: true
        }
        let payoff = await this.model.update(loan, id)
        if(payoff.status) return new StatusLogger({code: 200, message:`${name} loans is finished`})
        return payoff
    }

    async delete({id}){

        // validate loan
        let validator = await loanValidator(await this.read({id: id}))
        if(validator.status == false) return validator

        return await this.model.delete(id)
    }
}

function calculateDuration(loan_start, loan_duration){
    let loan_end = new DateFormat(loan_start)
    loan_end.addMonths = Number(loan_duration)
    loan_end = loan_end.toISOString(false)

    loan_start = new DateFormat(loan_start).toISOString(false)

    return {loan_start, loan_end}
}

function calculateInterest(total_loan, loan_interest, loan_duration){
    let monthly_interest = total_loan * loan_interest / 100
    // rounded up to 100
    let rounded_interest = Math.ceil(monthly_interest / 100) * 100
    return rounded_interest * loan_duration
}

async function loanValidator({data, status}, skipProgression = false){

    if(status == false) {
        return new StatusLogger({code: 404, message: 'Loan not found'}).log
    }
    if(skipProgression){
        return new DataLogger({data}).log
    }
    if(data?.is_valid || data?.is_finish){
        return new StatusLogger({code: 400, message: 'Loan is in progress or already finish'}).log
    }
    return new DataLogger({data}).log
}

module.exports = { LoanFactory }