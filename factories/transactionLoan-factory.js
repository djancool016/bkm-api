const {BaseModel} = require('./base-factory')
const {TransactionFactory} = require('./transaction-factory')
const {LoanFactory} = require('./loan-factory')
const {StatusLogger, DateFormat} = require('../utils')
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
                        attributes: ['id','name']
                    }
                ]
            }
        ]
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
    findByIdLoan(id_loan){
        this.query.where = {id_loan: id_loan}
        return this.findAll()
    }
    findByIdTransaction(id_transaction){
        this.query.where = {id_transaction: id_transaction}
        return this.findAll()
    }
    findByIdKsm(id_ksm){
        this.query.where = {'$loan.ksm.id$': id_ksm}
        return this.findOne()
    }
}

class TransactionLoanFactory {
    constructor(){
        this.model = new TransactionLoan()
        this.loan = new LoanFactory()
        this.transaction = new TransactionFactory()
    }

    async create({id_loan, id_transaction}){
        if(!id_loan || !id_transaction) return new StatusLogger({code:400}).log

        let loan = await this.loan.read({id: id_loan})
        let transaction = await this.transaction.read({id: id_transaction})

        if(loan.status == false) return loan
        if(transaction.status == false) return transaction

        return await this.model.create({
            id_loan,
            id_transaction
        })
    }
    async read({id, id_transaction, id_loan, id_ksm}){
        if(id){
            return await this.model.findByPk(id)
        }else if(id_transaction){
            return await this.model.findByIdTransaction(id_transaction)
        }else if(id_loan){
            return await this.model.findByIdLoan(id_loan)
        }else if(id_ksm){
            return await this.model.findByIdKsm(id_ksm)
        }else {
            return new StatusLogger({code: 400})
        }
    }
    async delete(id){
        return await this.model.delete(id)
    }
}

module.exports = { TransactionLoanFactory }