const {BaseModel} = require('./base-factory')
const {StatusLogger} = require('../utils')
const model = require('../models')

class CoaModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Coa
        this.query = {
            attributes: ['id','code', 'description'],
            include: [
                {
                    model: model.Account,
                    as: 'account',
                    attributes: ['id', 'counter', 'description']
                }
            ]
        }

    }
    findByAccount(id_account){
        this.query.where = {id_account: id_account}
        return this.findAll()
    }
    findByCode(code){
        this.query.where = {code}
        return this.findAll()
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
    async read({id, id_coa, id_account, ids = []}){

        let result

        if(id || id_coa){
            result = await this.model.findByPk(id || id_coa)
        } 
        else if (code) {
            result = await this.model.findByCode(code)
        } 
        else if (id_account) {
            result = await this.model.findByAccount(id_account)
        } 
        else if (ids.length > 0){
            result = await this.model.findByIds(ids)
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message:'COA not found'}).log
    }
    async update({id, code, id_account, description}){

        return await this.model.update({
            code,
            id_account,
            description
        }, id)
    }
    async delete({id}){

        return await this.model.delete(id)

    }
}

module.exports = { CoaFactory }