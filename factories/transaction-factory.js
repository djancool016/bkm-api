const {BaseModel} = require('./base-factory')
const {CoaFactory} = require('./coa-factory')
const {LoanFactory} = require('./loan-factory')
const {TransactionLoanFactory} = require('./transactionLoan-factory')
const {LoanPaymentFactory} = require('./loanPayment-factory')
const {AccountFactory} = require('./account-factory')
const {StatusLogger, DateFormat} = require('../utils')
const model = require('../models')
const { dateToCode } = require('../utils/baseUtils')

class TransactionModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Transaction
        this.query = {
            attributes: ['id','id_lkm','trans_code','total','remark'],
            include: [
                {
                    model: model.Coa,
                    as: 'coa',
                    attributes: ['id','description'],
                    include: [
                        {
                            model: model.Register,
                            as: 'register',
                            attributes: ['id','code','description']
                        },
                        {
                            model: model.Account,
                            as: 'account',
                            attributes: ['id','code','description']
                        }
                    ]
                }
            ]
        }
    }
    findLatestOne(){
        this.query.order = [['updated_at','DESC']]
        return this.findOne()
    }
    findByLkm(id_lkm){
        this.query.where = {id_lkm: id_lkm}
        return this.findAll()
    }
    findByCoa(id_coa){
        this.query.where = {id_coa: id_coa}
        return this.findAll()
    }
    findByTransCode(trans_code){
        this.query.where = {trans_code: trans_code}
        return this.findAll()
    }
    findByRegister(id_register){
        this.query.where = {'$coa.register.id$': id_register}
        return this.findAll()
    }
    findByAccount(id_account){
        this.query.where = {'$coa.account.id$': id_account}
        return this.findAll()
    }

}

class TransactionFactory {
    constructor(){
        this.model = new TransactionModel()
        this.coa = new CoaFactory()
        this.loan = new LoanFactory()
        this.account = new AccountFactory()
        this.transactionLoan = new TransactionLoanFactory()
        this.loanPayment = new LoanPaymentFactory()
    }

    async create({id_coa, id_loan, total, remark, trans_date}){

        // validate not null input
        if(!total || !id_coa) return new StatusLogger({code: 400}).log

        // validate coa
        let coa = await this.coa.read({id: id_coa})
        let {data:{account, description}} = coa
        if(coa.status == false) return coa

        // build transaction object
        trans_date = new DateFormat(trans_date).toISOString(false) || new DateFormat().toISOString(false)
        let counter = Number(account.counter) + 1
        let trans_code = `${account.code}/${dateToCode(trans_date)}/${String(counter).padStart(4, '0')}`

        let transaction = {
            id_lkm: 1,
            id_coa: id_coa,
            trans_date: trans_date,
            trans_code: trans_code,
            total: total,
            remark: remark || description,
        }

        // update counter
        let updateCounter = () => {
            return this.account.update({id: account.id, counter: counter})
        }
        let transactionResult

        switch(id_coa){
            // case 1 = Loan Payment transaction
            // case 2 = Loan Interest Payment transaction
            case 1 || 2:
                return updateCounter()
                .then(result => {
                    // validate loan
                    if(result.status == false) return result
                    return this.loan.read({id: id_loan})
                })
                .then(result => {
                    // validate loan remaining
                    if(result.status == false) return result
                    if(result.data.is_valid == false) return new StatusLogger({code: 400, message:'Loan is not approved yet'}).log
                    if(result.data.is_finish) return new StatusLogger({code: 400, message:'Loan is already finish'}).log

                    return this.loanPayment.getTotalRemaining({id_loan})
                })
                .then(result => {
                    // create a transaction
                    if(result.status == false) return result
                    let{remainingLoan, remainingInterests} = result.data

                    if(id_coa == 1 && total > remainingLoan) {
                        return new StatusLogger({code: 400, message:`Loan remaining (${remainingLoan}) less than input (${total})`}).log
                    }
                    else if(id_coa == 2 && total > remainingInterests) {
                        return new StatusLogger({code: 400, message:`Loan remaining (${remainingInterests}) less than input (${total})`}).log
                    }
                    return this.model.create(transaction)
                })
                .then(result => {
                    // create a transactionLoan
                    if(result.status == false) return result
                    return this.transactionLoan.create({id_loan, id_transaction: result.data.id})
                })
                .then(result => {
                    // update loanPayment
                    transactionResult = result
                    if(result.status == false) return result
                    if(id_coa == 1) return this.loanPayment.payment({id_loan, pay_loan: total})
                    return this.loanPayment.payment({id_loan, pay_interest: total})
                }).then(result => {
                    // update loanPayment
                    if(result.status == false) return result
                    return transactionResult
                })
                .catch(error => {
                    console.log(error)
                    return new StatusLogger({code: 500, message: 'Failed to save transaction loan'}).log
                })

            default:
                return updateCounter()
                .then(result => {
                    if(result.status == false) return result
                    return this.model.create(transaction)
                })
                .catch(error => {
                    console.log(error)
                    return new StatusLogger({code: 500, message: 'Failed to save transaction loan'}).log
                })
        }
    }

    async read({id, id_coa, id_account, id_register, trans_code, findLatest = false}){

        if(id){
            return await this.model.findByPk(id)
        }else if(id_coa) {
            return await this.model.findByCoa(id_coa)
        }else if(id_account){
            return await this.model.findByAccount(id_account)
        }else if(id_register){
            return await this.model.findByRegister(id_register)
        }else if(trans_code){
            return await this.model.findByTransCode(trans_code)
        }else if(findLatest){
            return await this.model.findLatestOne()
        }else {
            return new StatusLogger({code: 404, message: 'Transaction not found'}).log
        }
    }

    async update({id, id_coa, total, trans_date, remark}){

        // validate coa
        let{data:{account}} = await this.coa.read({id: id_coa})
        if(!account) return new StatusLogger({code: 404, message:"COA not found"}).log

        // validate date
        trans_date = new DateFormat(trans_date).toISOString(false) || new DateFormat().toISOString(false)
        if(trans_date == 'Invalid date') return new StatusLogger({code: 400, message: "invalid date"}).log

        let transaction = {
            id_coa:id_coa,
            total: total,
            trans_date: trans_date,
            remark: remark
        }

        return await this.model.update(transaction, id)
    }

    async delete({id}){
        return await this.model.delete(id)
    }
}

module.exports = { TransactionFactory }