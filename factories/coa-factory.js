const {BaseModel} = require('./base-factory')
const model = require('../models')
const {Op} = require('sequelize')
const { StatusLogger } = require('../utils')

class CoaModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Coa
        this.query = {}
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
}

class CoaFactory {
    constructor(){
        this.model = new CoaModel()
    }

    async create({id_register, id_account, description}){
        if(!id_register || !id_account || !description){
            return new StatusLogger({code: 400}).log
        }
        
        return await this.model.create({
            id_register: id_register,
            id_account: id_account,
            description: description
        })
    }

    async read({id, id_register, id_account, findLatest = false}){

        if(id){
            return await this.model.findByPk(id)

        } else if (id_register) {
            return await this.model.findByRegister(id_register)

        } else if (id_account) {
            return await this.model.findByAccount(id_account)

        } else if (findLatest) {
            return await this.model.findLatestOne()

        } else {
            return await this.model.findAll()

        }
    }

    async update({id, id_register, id_account, description}){
        return await this.model.update({
            id_register: id_register,
            id_account: id_account,
            description: description
        }, id)
    }

    async delete(id){
        return await this.model.delete(id)

    }
}

module.exports = { CoaFactory }