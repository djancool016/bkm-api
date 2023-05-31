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

    async create({loans = [], ksm, total_loan, loan_duration, loan_interest}){

        if(!ksm?.id || !total_loan || !loan_duration || !loan_interest){
            return new StatusLogger({code: 400, message:'loan have invalid input'}).log
        }
        if(loans.length > 0){

            for(let i = 0 ; i < loans.length; i++){

                let{is_valid, is_finish} = loans[i]

                if(is_valid == false) return new DataLogger({
                    data: loans[i], 
                    code: 400, 
                    message:`KSM ${ksm.name} have unapproved loan, please delete it before creating a new one`
                }).log

                if(is_finish) return new DataLogger({
                    data: loans[i], 
                    code: 400, 
                    message:`KSM ${ksm.name} have unfinished loan, please finish it before creating a new one`
                }).log
            }
        }

        // build loan object
        let total_interest = calculateInterest(total_loan, loan_interest,loan_duration)
        let loan = {
            id: ksm.id,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }
        return await this.model.create(loan)
    }

    async bulkCreate({ksmLoans=[], loans=[]}){

        // array validator
        if(Array.isArray(loans) == false) return new StatusLogger({code: 400, message:'input is not an array'}).log

        let uniqueKsmId = new Set()

        // validate each of ksms loans
        for(let i = 0; i < ksmLoans.length; i++){

            let{ksm, is_valid, is_finish} = ksmLoans[i]

            if(is_valid == false) return new StatusLogger({
                code: 400, 
                message:`KSM ${ksm.name} have unapproved loan`
            }).log

            if(is_finish == false) return new StatusLogger({
                code: 400, 
                message:`KSM ${ksm.name} have unfinished loan`
            }).log
            
            if(uniqueKsmId.has(ksm.id)) return new StatusLogger({
                code: 400, 
                message:`KSM ${ksm.name} have multiple loan`
            }).log

            uniqueKsmId.add(ksm.id) 
        }

        // start create new loans
        for(let i = 0; i < loans.length; i++){

            let{id_ksm, total_loan, loan_duration, loan_interest} = loans[i]

            if(!id_ksm || !total_loan || !loan_duration || !loan_interest){   
                return new StatusLogger({code: 400, message:'Loans have invalid input'}).log
            }
            let total_interest = calculateInterest(total_loan, loan_interest, loan_duration)
            loans[i].total_interest = total_interest
        }

        return await this.model.bulkCreate(loans)
    }

    async read({id, id_loan, id_ksm, ksmIds, ksm_name, findLatest = false, id_lkm, loanIds = []}){

        if(id || id_loan){
            return await this.model.findByPk(id = id || id_loan)
        }
        else if(ksm_name){
            return await this.model.findByKsmName(ksm_name)
        }
        else if(id_ksm || ksmIds){
            return await this.model.findByKsmId(id_ksm = id_ksm || ksmIds)
        }
        else if(id_lkm){
            return await this.model.findByLkmId(id_lkm)
        }
        else if(findLatest){
            return await this.model.findLatestOne()
        }
        else if(loanIds.length > 0){
            return await this.model.findByIds(loanIds)
        }
        else {
            return new StatusLogger({code: 404, message:'Loan not found'}).log
        }
    }

    async update({loan, ksm, total_loan, loan_duration, loan_interest}){

        let{loan_duration: old_duration, loan_interest: old_interest, is_valid, is_finish} = loan

        if(is_finish) return isFinish(is_finish)
        if(is_valid) return isValid(is_valid)

        let total_interest

        if(total_loan){
            loan_duration = loan_duration? loan_duration : old_duration
            loan_interest = loan_interest? loan_interest : old_interest
            total_interest = calculateInterest(total_loan, loan_interest, loan_duration)
        }
        
        let loanData = {
            id_ksm: ksm?.id,
            total_loan,
            total_interest,
            loan_duration,
            loan_interest,
        }

        return await this.model.update(loanData, id)
    }

    async loanApproval({loan, start_date = new Date()}){

        let {id, loan_duration, is_valid, is_finish} = loan

        if(is_finish) return isFinish(is_finish)
        if(is_valid) return isValid(is_valid)

        let {loan_start, loan_end} = calculateDuration(start_date, loan_duration)

        let approved = {
            loan_start,
            loan_end,
            is_valid: true
        }
        return await this.model.update(approved, id)
    }

    async bulkLoanApproval({loans}){

        let approvedId = []
        if(loans.length > 0){
            for(let i = 0 ; i < loans.length; i++){
                let approve = await this.loanApproval({loan: loans[i], start_date: loans[i].start_date})
                if(approve.status) approvedId.push(loans[i].id)
            }
        }
        return new DataLogger({data: approvedId}).log
    }

    async paidOff({loan}){

        let {id, ksm:{name}, is_valid, is_finish} = loan

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

        let {id, is_valid, is_finish} = loan

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
function isFinish(is_valid){
    if(is_valid) return new StatusLogger({code: 400, message: 'Loan is already validated'}).log
    return new StatusLogger({code: 400, message: 'Loan is currently not validated'}).log
}
function isValid(is_finish){
    if(is_valid) return new StatusLogger({code: 400, message: 'Loan is already finished'}).log
    return new StatusLogger({code: 400, message: 'Loan is currently not finished'}).log
}

module.exports = { LoanFactory }