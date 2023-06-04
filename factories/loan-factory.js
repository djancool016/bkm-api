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
                attributes: ['id', 'id_lkm', 'name'],
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
    findByLkmId(id_lkm){
        this.query.where = {'$ksm.id_lkm$': id_lkm}
        return this.findAll()
    }
    findByIds(loanIds){
        this.query.where = {id: loanIds}
        return this.findAll()
    }
}

class LoanFactory {
    constructor(){
        this.model = new LoanModel()
        this.ksm = new KsmFactory()
    }

    async create({loan = [], ksm, requestBody:{id, total_loan, loan_duration, loan_interest}}){

        if(!ksm || ksm.status == false ){
            return new StatusLogger({code: 404, message:'KSM not found'}).log
        }
        if(!total_loan || !loan_duration || !loan_interest){
            return new StatusLogger({code: 400, message:'Invalid input'}).log
        }
        
        let {id:id_ksm, name} = ksm.data
        let {status, data: loan_data} = loan

        if(status){

            for(let i = 0 ; i < loan_data.length; i++){

                let{is_valid, is_finish} = loan_data[i]

                if(is_valid == false) return new StatusLogger({
                    code: 400, 
                    message:`(KSM ${name}) have unapproved loan`
                }).log

                if(is_finish == false) return new StatusLogger({
                    code: 400, 
                    message:`(KSM ${name}) have unfinished loan`
                }).log
            }
        }

        // build loan object
        let total_interest = calculateInterest(total_loan, loan_interest,loan_duration)
        let body = {
            id,
            id_ksm: id_ksm,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
            loan_start: null,
            loan_end: null,
            is_valid: false,
            is_finish: false
        }
        let result = await this.model.create(body)
        result.message = `(KSM ${name}) ${result.message}`
        return result
    }

    async read({id, id_loan, id_ksm, ksmIds, ksm_name, findLatest = false, id_lkm, loanIds = []}){

        let result

        if(id_loan || id){
            result = await this.model.findByPk(id = id || id_loan)
        }
        else if(ksm_name){
            result = await this.model.findByKsmName(ksm_name)
        }
        else if(id_ksm || ksmIds){
            result = await this.model.findByKsmId(id_ksm = id_ksm || ksmIds)
        }
        else if(id_lkm){
            result = await this.model.findByLkmId(id_lkm)
        }
        else if(findLatest){
            result = await this.model.findLatestOne()
        }
        else if(loanIds.length > 0){
            result = await this.model.findByIds(loanIds)
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message:'Loan not found'}).log
    }

    async update({loan, ksm, requestBody:{total_loan, loan_duration, loan_interest}}){

        if(loan.status == false) return loan
        if(ksm.status == false) return ksm

        let{id: id_ksm, name} = ksm.data
        let{id, loan_duration: old_duration, loan_interest: old_interest, is_valid, is_finish} = loan.data

        if(is_finish) return isFinish(is_finish, name)
        if(is_valid) return isValid(is_valid, name)

        let total_interest

        if(total_loan){
            loan_duration = loan_duration? loan_duration : old_duration
            loan_interest = loan_interest? loan_interest : old_interest
            total_interest = calculateInterest(total_loan, loan_interest, loan_duration)
        }
        
        let loanData = {
            id_ksm,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }

        let result = await this.model.update(loanData, id)
        result.message = `(KSM ${name}) ${result.message}`
        return result
    }

    async loanApproval({loan, loan_start = new Date(), ksm}){

        if(loan.status == false) return loan
        if(ksm.status == false) return ksm

        let {name} = ksm.data
        let {id, loan_duration, is_valid, is_finish} = loan.data

        if(is_finish) return isFinish(is_finish, name)
        if(is_valid) return isValid(is_valid, name)

        let duration = calculateDuration(loan_start, loan_duration)

        let approved = {
            loan_start: duration.loan_start,
            loan_end: duration.loan_end,
            is_valid: true
        }

        let result = await this.model.update(approved, id)
        if(result.status) result.message = `Successfully approved KSM ${name} loan`
        return result
    }

    async paidOff({loan}){

        let {id, ksm:{name}, is_valid, is_finish} = loan.data

        if(is_finish) return isFinish(is_finish)
        if(is_valid == false) return isValid(is_valid)

        let loadData = {
            is_finish: true
        }
        let result = await this.model.update(loadData, id)
        if(result.status) return new StatusLogger({code: 200, message:`${name} loans is finished`})
        return result
    }

    async delete({loan}){

        if(loan.satus == false) return loan

        let {id, is_valid, is_finish} = loan.data

        if(is_finish) return isFinish(is_finish)
        if(is_valid) return isValid(is_valid)

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
function isValid(is_valid, ksm_name){
    
    let logger = new StatusLogger({code: 400, message: 'Loan is currently not validated'}).log
    if(is_valid) logger.message = `Loan is already validated`
    if(ksm_name) logger.message = `(KSM ${ksm_name}) ${logger.message}`

    return logger
}
function isFinish(is_finish, ksm_name){

    let logger = new StatusLogger({code: 400, message: 'Loan is currently not finished'}).log
    if(is_finish) logger.message = `Loan is already finished`
    if(ksm_name) logger.message = `(KSM ${ksm_name}) ${logger.message}`

    return logger
}

module.exports = { LoanFactory }