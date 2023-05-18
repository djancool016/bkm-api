const {BaseModel} = require('./base-factory')
const model = require('../models')
const {Op} = require('sequelize')
const { StatusLogger } = require('../utils')

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
}

class AccountFactory{
    constructor(){
        this.model = new AccountModel()
    }

    async create({code, description}){
        if(!code || !description){
            return new StatusLogger({code: 400}).log
            
        }
        return await this.model.create({
            code: code,
            description: description
        })
    }

    async read({id, code, findLatest = false}){
        if(id){
            return await this.model.findByPk(id)

        } else if(code){
            return await this.model.findByCode(code)

        } else if (findLatest) {
            return await this.model.findLatestOne()

        } else {
            return await this.model.findAll()

        }
    }

    async update({id, code, description}){
        return await this.model.update({
            code: code,
            description: description
        }, id)
    }

    async delete(id){
        return await this.model.delete(id)
    }

}

module.exports = { AccountFactory }