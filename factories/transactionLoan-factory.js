const {BaseModel} = require('./base-factory')
const {LoanPaymentFactory} = require('./loanPayment-factory')
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
                        attributes: ['id','name']
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

class TransactionLoanFactory {
    constructor(){
        this.model = new TransactionLoan()
        this.transaction = new TransactionFactory()
        this.loanPayment = new LoanPaymentFactory()
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
    async createBop({loan, transaction}){
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
                url: 'http://localhost:5100/transactionLoan'
            })
        }
        if(pay_interest){
            transactionLIB.push({
                id_loan, 
                id_lkm, 
                id_type: id_type(40, 5),
                trans_date, 
                total : pay_interest,
                url: 'http://localhost:5100/transactionLoan'
            })
        }
        if(pay_bop){
            transactionLIB.push({
                id_loan, 
                id_lkm, 
                id_type: id_type(41, 6),
                trans_date, 
                total : pay_bop,
                url: 'http://localhost:5100/transactionBop'
            })
        }

        return transactionLIB
    }
    async checkPayments({loan, loanPayment, requestBody, transactionLoan}){

        if(loan.status == false) return loan
        if(loanPayment.status == false) return loanPayment
        if(transactionLoan && transactionLoan.status == false) return loanPayment

        let {id_type, total} = requestBody
        if(!id_type || !total) return new StatusLogger({code:400, message:"Invalid input"}).log

        let {total_loan, total_interest, is_finish, is_valid, ksm:{name}} = loan.data
        let remaining = {loan:0, interest:0}
        let full = {loan:0, interest:0}
        let paid = {loan:0, interest:0}
        let pay = {loan:0, interest:0}

        if(is_finish){
            return new StatusLogger({code: 400, message:`Loan KSM ${name} is already finish`}).log
        }
        if(is_valid == false){
            return new StatusLogger({code: 400, message:`Loan KSM ${name} is not approved`}).log
        }
        
        switch(id_type){
            case 4,39:
                pay.loan = total
                break
            case 5,40:
                pay.interest = total
                break
            default:
                break
        }

        for(let i = 0; i < loanPayment.data.length; i++){
            
            let {loan_full, loan_remaining, interest_full, interest_remaining} = loanPayment.data[i]

            remaining.loan += loan_remaining
            remaining.interest += interest_remaining

            full.loan += loan_full,
            full.interest += interest_full
        }
        
        if(transactionLoan.data){
            for(let i = 0; i < transactionLoan.data.length; i++){

                let {transaction} = transactionLoan.data[i]

                switch(transaction.id_type){
                    case 4,39:
                        paid.loan = transaction.total
                        break
                    case 5,40:
                        paid.interest = transaction.total
                        break
                    default:
                        break
                }
            }  
        }
        
        if((full.loan != total_loan) || (full.interest != total_interest)){
            return new StatusLogger({code: 400, message:`Loan Payment KSM ${name} is wrong, please check first`}).log
        }
        if((paid.loan + pay.loan > total_loan) || (pay.loan > remaining.loan)){
            return new StatusLogger({code: 400, message:`Loan KSM ${name} is exceeding loan payment`}).log
        }
        if((paid.interest + pay.interest > total_interest) || (pay.interest > remaining.interest) ){
            return new StatusLogger({code: 400, message:`Interest KSM ${name} is exceeding interest payment`}).log
        }
        return new DataLogger({data: {loan, full, paid, pay}, message:'Loan Payment ready to proccess'}).log
    }

    async checkBop({loan, requestBody:{id_type}}){

        if(loan.status == false) return loan

        switch(id_type){
            case 6,41:
                return new StatusLogger({code: 200, message:'BOP payment transaction'}).log 
            case 37:
                return new StatusLogger({code: 200, message:'BOP withdrawal transaction'}).log 
            default:
                return new StatusLogger({code: 400, message:`Type Transaction ID  is not a BOP transaction`}).log  
        }
    }

    async read({id, id_transaction, id_loan, id_ksm, start_date, end_date}){

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
        
        if(result.status) return result
        return new StatusLogger({code: 400, message:"Transaction Loan not found"}).log
    }
}

module.exports = { TransactionLoanFactory }