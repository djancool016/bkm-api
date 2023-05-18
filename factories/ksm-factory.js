const {BaseModel} = require('./base-factory')
const model = require('../models')
const {Op} = require('sequelize')
const { StatusLogger } = require('../utils')

class KsmModel extends BaseModel {
    constructor(){
        super()
        this.model = model.Ksm
        this.query = {}
    }
    findByKsmName(name){
        this.query.where = {name: {[Op.like]: `%${name}%`}}
        return this.findAll()
    }
    findByKsmRw(rw){
        this.query.where = {rw: rw}
        return this.findAll()
    }
}

class KsmFactory {
    constructor(){
        this.model = new KsmModel()
    }

    async create({id_lkm, name, rw}){

        if(!id_lkm || !name || !rw){
            return new StatusLogger({code: 400}).log
        }

        return await this.model.create({
            id_lkm: id_lkm,
            name: name,
            rw: rw
        })
    }

    async read({id, name, rw}){

        if(id){
            return await this.model.findByPk(id)
        }
        else if(name){
            return await this.model.findByKsmName(name)

        }else if(rw){
            return await this.model.findByKsmRw(rw)
        }
        else {
            return await this.model.findAll()
        }
    }

    async update({id, name, rw, id_lkm}){

        return await this.model.update({
            id_lkm: id_lkm,
            name:name,
            rw:rw
        }, id)
    }

    async delete(id){

        return await this.model.delete(id)
    }
}

module.exports = { KsmFactory }