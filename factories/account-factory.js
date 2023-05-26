const {BaseModel} = require('./base-factory')
const { StatusLogger } = require('../utils')
const model = require('../models')

class AccountModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Account
        this.query = {}
    }
    findByCode(code){
        this.query.where = {code: code}
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

class AccountFactory{
    constructor(){
        this.model = new AccountModel()
    }
    async create({code, description}){
        if(!code || !description){
            return new StatusLogger({code: 400, message:'account have invalid input'}).log
            
        }
        return await this.model.create({
            code: code,
            description: description
        })
    }
    async read({id, code, findLatest = false, ids = []}){
        if(id){
            return await this.model.findByPk(id)
        }
        else if(code){
            return await this.model.findByCode(code)
        } 
        else if (findLatest){
            return await this.model.findLatestOne()
        } 
        else if(ids.length > 0){
            return await this.model.findByIds(ids)
        }
        else {
            return await this.model.findAll()
        }
    }
    async update({id, code, description, counter}){
        return await this.model.update({
            code: code,
            description: description,
            counter: counter
        }, id)
    }
    async delete(id){
        
        return await this.model.delete(id)
    }
}

module.exports = { AccountFactory }