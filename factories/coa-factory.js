const {BaseModel} = require('./base-factory')
const {StatusLogger} = require('../utils')
const model = require('../models')

class CoaModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Coa
        this.query = {
            attributes: ['id', 'description'],
            include: [
                {
                    model: model.Register,
                    as: 'register',
                    attributes: ['id', 'code', 'description']
                },
                {
                    model: model.Account,
                    as: 'account',
                    attributes: ['id', 'code', 'counter', 'description']
                }
            ]
        }

    }
    findByRegister(id_register){
        this.query.where = {id_register: id_register}
        return this.findAll()
    }
    findByAccount(id_account){
        this.query.where = {id_account: id_account}
        return this.findAll()
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
    findByIds(ids){
        this.query.where = {id: ids}
        return this.findAll()
    }
}

class CoaFactory {
    constructor(){
        this.model = new CoaModel()
    }
    async create({id_register, id_account, description}){

        if(!id_register || !id_account || !description){
            return new StatusLogger({code: 400, message:'coa have invalid input'}).log
        }
        
        return await this.model.create({
            id_register: id_register,
            id_account: id_account,
            description: description
        })
    }
    async read({id, id_register, id_account, findLatest = false, ids = []}){

        if(id){
            return await this.model.findByPk(id)
        } 
        else if (id_register) {
            return await this.model.findByRegister(id_register)
        } 
        else if (id_account) {
            return await this.model.findByAccount(id_account)
        } 
        else if (findLatest) {
            return await this.model.findLatestOne()
        }
        else if (ids.length > 0){
            return await this.model.findByIds(ids)
        }
        else {
            return await this.model.findAll()
        }
    }
    async update({id, id_register, id_account, description}){

        return await this.model.update({
            id_register,
            id_account,
            description
        }, id)
    }
    async delete(id){

        return await this.model.delete(id)

    }
}

module.exports = { CoaFactory }