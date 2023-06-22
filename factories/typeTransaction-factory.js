const {BaseModel} = require('./base-factory')
const {StatusLogger, DateFormat} = require('../utils')
const model = require('../models')
const {Op} = require('sequelize')

class TypeTransactionModel extends BaseModel {
    constructor(){
        super()
        this.model = model.typeTransaction
        this.query = {
            attributes: ['id','description'],
            include: [
                {
                    model: model.typeTransactionGroup,
                    as: 'group',
                    attributes: ['id','description']
                }
            ]
        }
    }
    findByIds(ids){
        this.query.where = {id: ids}
        return this.findAll()
    }
    findByGroup(id_group){
        this.query.where = {id_group}
        return this.findAll()
    }
}

class TypeTransactionFactory {
    constructor(){
        this.model = new TypeTransactionModel
    }
    async read({id_type, id , id_group}){

        let result
        id = id_type || id

        if(Array.isArray(id)){
            result = await this.model.findByIds(id)
        }
        else if(id){
            result = await this.model.findByPk(id)
        }
        else if(id_group){
            result = await this.model.findByGroup(id_group)
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message: 'Type Transaction not found'}).log
    }
}

module.exports = { TypeTransactionFactory }