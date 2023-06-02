const {BaseModel} = require('./base-factory')
const {StatusLogger} = require('../utils')
const model = require('../models')
const {Op} = require('sequelize')

class LkmModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Lkm
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
    findByName(name){
        this.query.where = {name: {[Op.like]: `%${name}%`}}
        return this.findAll()
    }
    findByIds(ids){
        this.query.where = {id: ids}
        return this.findAll()
    }
}

class LkmFactory {
    constructor(){
        this.model = new LkmModel()
    }
    async create({id, id_kelurahan, name, phone, address}){

        if(!id_kelurahan || !name || !phone || !address) {
            return new StatusLogger({code: 400, message:'LKM have invalid input'}).log
        }
        return await this.model.create({
            id,
            id_kelurahan,
            name,
            phone,
            address
        })
    }
    async read({id, id_lkm, name, findLatest = false, ids = []}){

        let result 

        if(id_lkm || id){
            result = await this.model.findByPk(id_lkm || id)
        }
        else if(name){
            result = await this.model.findByName(name)
        }
        else if(findLatest){
            result = await this.model.findLatestOne()
        }
        else if(ids.length > 0){
            result = await this.model.findByIds(ids)
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message:'LKM not found'}).log
    }

    async update({id, id_kelurahan, name, phone, address}){
        let update = await this.model.update({
            id_kelurahan,
            name,
            phone,
            address
        }, id)

        if(update.code == 404) update.message = "LKM not found"
        return update
    }
    async delete({id}){
        
        return await this.model.delete(id)
    }
}

module.exports = { LkmFactory }