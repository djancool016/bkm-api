const {BaseModel} = require('./base-factory')
const {LoanPaymentFactory} = require('./loanPayment-factory')
const {TransactionFactory} = require('./transaction-factory')
const {StatusLogger, DataLogger} = require('../utils')
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
    findByIds(ids){
        this.query.where = {id: ids}
        return this.findAll()
    }
    findByTransCode(trans_code){
        this.query.where = {'$transaction.trans_code$': trans_code}
        return this.findOne()
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
        if(loan.status == false) return transaction

        // start transactionLoan query
        let create = await this.model.create({
            id_loan: loan.data.id,
            id_transaction: transaction.data.id
        })
        return create
    }
    async checkPayments({loan, loanPayment, requestBody, transactionLoan}){

        if(loan.status == false) return loan
        if(loanPayment.status == false) return loanPayment
        if(transactionLoan && transactionLoan.status == false) return loanPayment

        let {id_coa, total} = requestBody
        if(!id_coa || !total) return new StatusLogger({code:400, message:"Invalid input"}).log

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
        
        switch(id_coa){
            case 16:
                pay.loan = total
                break
            case 17:
                pay.interest = total
                break
            default:
                return new StatusLogger({code: 400, message:'Invalid Transaction Coa'}).log
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

                switch(transaction.id_coa){
                    case 16:
                        paid.loan = transaction.total
                        break
                    case 17:
                        paid.interest = transaction.total
                        break
                    default:
                        break
                }
            }  
        }
        console.log({full, paid, remaining, pay})
        
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

    async read({id, id_transaction, id_loan, id_ksm, trans_code,ids = []}){
        if(id){
            return await this.model.findByPk(id)
        }
        else if(id_transaction){
            return await this.model.findByIdTransaction(id_transaction)
        }
        else if(id_loan){
            return await this.model.findByIdLoan(id_loan)
        }
        else if(id_ksm){
            return await this.model.findByIdKsm(id_ksm)
        }
        else if(trans_code){
            return await this.model.findByTransCode(trans_code)
        }
        else if(ids.length > 0){
            return await this.model.findByIds(ids)
        }
        else {
            return new StatusLogger({code: 400, message:"Transaction Loan not found"}).log
        }
    }
    async delete(id){
        return await this.model.delete(id)
    }
}

module.exports = { TransactionLoanFactory }