const {BaseModel} = require('./base-factory')
const {StatusLogger, DateFormat} = require('../utils')
const model = require('../models')
const {Op} = require('sequelize')

class TransactionModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Transaction
        this.query = {
            attributes: ['id','id_lkm','id_type','trans_date','total','remark']
        }
    }
    findByTransCode(trans_code){
        this.query.where = {trans_code: trans_code}
        return this.findAll()
    }
    findByIds(transactionIds, id_lkm, start_date, end_date){
        this.query.where = {id: transactionIds}
        this.queryOption(id_lkm, start_date, end_date)
        return this.findAll()
    }
    findByLkm(id_lkm, start_date, end_date){
        this.queryOption(id_lkm, start_date, end_date)
        return this.findAll()
    }
    queryOption(id_lkm, start_date, end_date){

        if(start_date || end_date){
            start_date = new DateFormat(start_date? start_date : "2000-01-01").toISOString(false)
            end_date = new DateFormat(end_date? end_date : new Date()).toISOString(false)
            this.query.where = { ...this.query.where, ['trans_date']: {[Op.between]: [start_date, end_date]}} 
        }
        if(id_lkm){
            this.query.where = { ...this.query.where, ['id_lkm']: id_lkm}
        }
    }
}

class TransactionFactory {
    constructor(){
        this.model = new TransactionModel()
    }
    async create({lkm, typeTransaction, requestBody: {id_type, total, remark, trans_date}, loan, ksm}){

        if(lkm.status == false) return lkm
        if(typeTransaction.status == false) return typeTransaction
        if(ksm && ksm.status == false) return ksm

        // build transaction object
        trans_date = new DateFormat(trans_date).toISOString(false) || new DateFormat().toISOString(false)
        remark = remark || typeTransaction.data.description

        let ksmName = () => {
            if(ksm?.data?.name) return ksm.data.name
            else if(loan?.data?.ksm?.name) return loan.data.ksm.name
            return ''
        }
        
        if(loan && loan.status) remark = `${typeTransaction.data.description} ${ksmName()}`

        let transaction = {
            id_lkm: lkm.data.id,
            id_type,
            trans_date: trans_date,
            total: total,
            remark,
        }

        return this.model.create(transaction)
    }

    async read({id, id_lkm, trans_code, start_date, end_date}){

        let result

        if(Array.isArray(id)){
            result = await this.model.findByIds(id, id_lkm, start_date, end_date)
        }
        else if(id){
            result = await this.model.findByPk(id)
        }
        else if(trans_code){
            result = await this.model.findByTransCode(trans_code)
        }
        else if(id_lkm){
            result = await this.model.findByLkm(id_lkm, start_date, end_date)
        }

        if(result.status) return result
        return new StatusLogger({code: 400, message: 'Transaction not found'}).log
    }
}

module.exports = { TransactionFactory }