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
    async create({id_kelurahan, name, phone, address}){

        if(!id_kelurahan || !name || !phone || !address) {
            return new StatusLogger({code: 400, message:'LKM have invalid input'}).log
        }

        return await this.model.create({
            id_kelurahan,
            name,
            phone,
            address
        })
    }
    async read({id, name, findLatest = false, ids = []}){

        if(id){
            return await this.model.findByPk(id)
        }
        else if(name){
            return await this.model.findByName(name)
        }
        else if(findLatest){
            return await this.model.findLatestOne()
        }
        else if(ids.length > 0){
            return await this.model.findByIds(ids)
        }
        else {
            return new StatusLogger({code: 404, message: "LKM not found"}).log
        }
    }
    async update({id, id_kelurahan, name, phone, address}){
        return await this.model.update({
            id_kelurahan,
            name,
            phone,
            address
        }, id)
    }
    async delete({id}){
        
        return await this.model.delete(id)
    }
}

module.exports = { LkmFactory }