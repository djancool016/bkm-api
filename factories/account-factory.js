const {BaseModel} = require('./base-factory')
const { StatusLogger } = require('../utils')
const model = require('../models')

class AccountModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Account
        this.query = {}
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
    async create({description}){
        if(!description){
            return new StatusLogger({code: 400, message:'account have invalid input'}).log
            
        }
        return await this.model.create({ description: description })
    }

    async read({id, id_account, ids = []}){
        if(id || id_account){
            return await this.model.findByPk(id = id || id_account)
        }
        else if(ids.length > 0){
            return await this.model.findByIds(ids)
        }
        else {
            return await this.model.findAll()
        }
    }
    async update({id, description, counter}){
        return await this.model.update({
            description: description,
            counter: counter
        }, id)
    }
    async delete(id){
        
        return await this.model.delete(id)
    }
}

module.exports = { AccountFactory }