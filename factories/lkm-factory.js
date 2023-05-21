const {BaseModel} = require('./base-factory')
const {StatusLogger} = require('../utils')
const model = require('../models')

class LkmModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Lkm
    }
    findLatestOne(){
        this.query.order = [['created_at','DESC']]
        return this.findOne()
    }
}

class LkmFactory {
    constructor(){
        this.model = new LkmModel()
    }
    async create({id_kelurahan, name, phone, address}){
        if(!id_kelurahan || !name || !phone || !address) return new StatusLogger({code: 400})

        return await this.model.create({
            id_kelurahan,
            name,
            phone,
            address
        })
    }
    async read({id, id_kelurahan, findLatest = false}){

        if(id){
            return await this.model.findByPk(id)
        }else if(findLatest){
            return await this.model.findLatestOne()
        }else {
            return new StatusLogger({code: 400})
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
    async delete(id){
        return await this.model.delete(id)
    }
}

module.exports = { LkmFactory }