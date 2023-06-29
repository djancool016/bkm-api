const {BaseModel} = require('./base-factory')
const {TransactionFactory} = require('./transaction-factory')
const {StatusLogger, DataLogger, DateFormat} = require('../utils')
const {Op} = require('sequelize')
const model = require('../models')

class TransactionLoan extends BaseModel {
    constructor(){
        super()
        this.model = model.TransactionLoan
        this.query.include = [
            {
                model: model.Loan,
                as: 'loan',
                include: [
                    {
                        model: model.Ksm,
                        as: 'ksm',
                        attributes: ['id','id_lkm', 'name']
                    }
                ]
            },
            {
                model: model.Transaction,
                as: 'transaction'
            }
        ]
    }
    findByIdLoan(id_loan, option){
        
        this.query.where = {id_loan}
        this.queryOption(option)
        return this.findAll()
    }
    findByIdTransaction(id_transaction, option){

        this.query.where = {id_transaction: id_transaction}
        this.queryOption(option)
        return this.findAll()
    }
    findByIdKsm(id_ksm, option){
        this.query.where = {'$loan.ksm.id$': id_ksm}
        this.queryOption(option)
        return this.findAll()
    }
    findByIdLkm(id_lkm, option){
        this.query.where = {'$loan.ksm.id_lkm$': id_lkm}
        this.queryOption(option)
        return this.findAll()
    }
    findByIds(ids, option){
        this.query.where = {id: ids}
        this.queryOption(option)
        return this.findAll()
    }
    queryOption({start_date, end_date}){

        if(start_date || end_date){
            start_date = new DateFormat(start_date? start_date : "2000-01-01").toISOString(false)
            end_date = new DateFormat(end_date? end_date : new Date()).toISOString(false)
            this.query.where = { ...this.query.where, ['$transaction.trans_date$']: {[Op.between]: [start_date, end_date]}} 
        }
    }
}

class TransactionLoanValidator {
    constructor({loanPayment, requestBody}){
        this.loanPayment = loanPayment.data
        this.requestBody = requestBody
    }
    get validateTotal(){

        const {remaining_loan, remaining_interest, remaining_bop} = this.loanPayment.paymentRemaining
        const {ksm:{name}} = this.loanPayment.loan
        const {total, id_type} = this.requestBody

        switch(id_type){
            case 4,39:
                if(total < remaining_loan) return new StatusLogger({
                    code: 400, message:`KSM ${name} payments exceeding loan payment`
                }).log
                break
            case 5,40:
                if(total < remaining_interest) return new StatusLogger({
                    code: 400, message:`KSM ${name} payments exceeding interest payment`
                }).log
                break
            case 6,41:
                if(total < remaining_bop) return new StatusLogger({
                    code: 400, message:`KSM ${name} payments exceeding BOP payment`
                }).log
                break
            default:
                return new StatusLogger({code: 400, message: 'Invalid id_type Loan Transaction'}).log
        }
    }
    get validateStatus(){

        const {ksm:{name}, is_valid, is_finish} = this.loanPayment.loan

        if(is_finish){
            return new StatusLogger({code: 400, message:`KSM ${name} loans already finish`}).log
        }
        if(is_valid == false){
            return new StatusLogger({code: 400, message:`KSM ${name} loans waiting for approval`}).log
        }
        
    }
}

class TransactionLoanFactory {
    constructor(){
        this.model = new TransactionLoan()
        this.transaction = new TransactionFactory()
    }
    async create({loan, transaction}){
        if(loan.status == false) return loan
        if(transaction.status == false) return transaction

        // start transactionLoan query
        let result = await this.model.create({
            id_loan: loan.data.id,
            id_transaction: transaction.data.id
        })
        result.message = `${result.message} ${transaction.data.remark}`
        return result
    }
    async createLIB(requestBody){
        let transactionLIB = []

        let{id_loan, id_lkm, trans_date, pay_loan, pay_interest, pay_bop, isFirstLedger} = requestBody

        let id_type = (a, b) => {
            if(isFirstLedger) return a
            return b
        }
        if(pay_loan){
            transactionLIB.push({
                id_loan, 
                id_lkm, 
                id_type: id_type(39, 4),
                trans_date, 
                total : pay_loan,
                url: 'http://localhost:5100/api/transactionLoan'
            })
        }
        if(pay_interest){
            transactionLIB.push({
                id_loan, 
                id_lkm, 
                id_type: id_type(40, 5),
                trans_date, 
                total : pay_interest,
                url: 'http://localhost:5100/api/transactionLoan'
            })
        }
        if(pay_bop){
            transactionLIB.push({
                id_loan, 
                id_lkm, 
                id_type: id_type(41, 6),
                trans_date, 
                total : pay_bop,
                url: 'http://localhost:5100/api/transactionLoan'
            })
        }

        return transactionLIB
    }
    async read({id, id_transaction, id_loan, id_ksm, id_lkm, start_date, end_date}){

        let result
        let option = {start_date, end_date}

        if(Array.isArray(id)){
            result = await this.model.findByIds(id)
        }
        else if(id){
            result = await this.model.findByPk(id)
        }
        else if(id_transaction){
            result = await this.model.findByIdTransaction(id_transaction, option)
        }
        else if(id_loan){
            result = await this.model.findByIdLoan(id_loan, option)
        }
        else if(id_ksm){
            result = await this.model.findByIdKsm(id_ksm, option)
        }
        else if(id_lkm){
            result = await this.model.findByIdLkm(id_lkm, option)
        }
        
        if(result.status) return result
        return new StatusLogger({code: 400, message:"Transaction Loan not found"}).log
    }
    // validate method is on progress
    async validate({loanPayment, requestBody}){
        const validator = new TransactionLoanValidator({loanPayment, requestBody})

        if(validator.status == false) return validator
        return new StatusLogger({code:200}).log
    }
}

module.exports = { TransactionLoanFactory }