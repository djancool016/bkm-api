const {BaseModel} = require('./base-factory')
const {CoaFactory} = require('./coa-factory')
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
    findByIds(transactionIds){
        this.query.where = {id: transactionIds}
        return this.findAll()
    }
}

class TransactionFactory {
    constructor(){
        this.model = new TransactionModel()
        this.account = new AccountFactory()
        this.coa = new CoaFactory()
    }
    async create({coa, lkm, requestBody: {total, remark, trans_date}}){

        if(!coa || coa.status == false) return coa
        if(!lkm || lkm.status == false) return lkm

        let{id: id_coa, description, account:{id: id_account, counter, code}} = coa.data

        // build transaction object
        trans_date = new DateFormat(trans_date).toISOString(false) || new DateFormat().toISOString(false)
        counter = Number(counter) + 1
        let trans_code = `${code}/${dateToCode(trans_date)}/${String(counter).padStart(4, '0')}`

        let transaction = {
            id_lkm: lkm.data.id,
            id_coa: id_coa,
            trans_date: trans_date,
            trans_code: trans_code,
            total: total,
            remark: remark || description,
        }

        // update counter
        let updateCounter = () => {
            return this.account.update({id: id_account, counter: counter})
        }

        return updateCounter()
            .then(result => {
                if(result.status == false) return result
                return this.model.create(transaction)
            })
            .then(result => {
                result.message = `${result.message} (${description})`
                return result
            })
            .catch(error => {
                console.log(error)
                return new StatusLogger({code: 500, message: 'Failed to save transaction loan'}).log
            })
    }

    async read({id, id_coa, id_account, id_register, trans_code, findLatest = false, transactionIds = []}){

        let result

        if(id){
            result = await this.model.findByPk(id)
        }
        else if(id_coa) {
            result = await this.model.findByCoa(id_coa)
        }
        else if(id_account){
            result = await this.model.findByAccount(id_account)
        }
        else if(id_register){
            result = await this.model.findByRegister(id_register)
        }
        else if(trans_code){
            result = await this.model.findByTransCode(trans_code)
        }
        else if(findLatest){
            result = await this.model.findLatestOne()
        }
        else if(transactionIds.length > 0){
            result = await this.model.findByIds(transactionIds)
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message:'Transaction not found'}).log
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