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
    findByLkm(id_lkm){
        this.query.where = {id_lkm: id_lkm}
        return this.findAll()
    }
    findByIds(ids){
        this.query.where = {id: ids}
        return this.findAll()
    }
}

class KsmFactory {
    constructor(){
        this.model = new KsmModel()
    }
    async create({id_lkm, name, rw}){

        if(!id_lkm || !name || !rw){
            return new StatusLogger({code: 400, message:'KSM have invalid input'}).log
        }
        return await this.model.create({id_lkm, name, rw})
    }
    async bulkCreate({ksms}){
        // input validator
        if(Array.isArray(ksms) == false) return new StatusLogger({code:400, message:'input is not an array'}).log

        // data requirement validator
        for(let i = 0; i > ksms.length; i++){
            if(!ksms[i].id_lkm || !ksms[i].name || !ksms[i].rw){
                return new StatusLogger({code: 400, message:'KSM have invalid input'}).log
            }
        }
        return await this.model.bulkCreate(ksms)
    }
    async read({id, id_ksm, id_lkm, name, findLatest = false, ksmIds = []}){

        let result

        if(id || id_ksm){
            result = await this.model.findByPk(id = id || id_ksm)
        }
        else if(name){
            result = await this.model.findByKsmName(name)
        }
        else if(id_lkm){
            result = await this.model.findByLkm(id_lkm)
        }
        else if(findLatest){
            result = await this.model.findLatestOne()
        }
        else if(ksmIds.length > 0){
            result = await this.model.findByIds(ksmIds)
        }

        if(result.data && Array.isArray(result?.data) == false) result.data = [result.data]
        if(result?.status) return result
        return new StatusLogger({code: 404, message:'KSM not found'}).log
    }
    async update({id, id_lkm, name, rw}){

        return await this.model.update({name, rw, id_lkm}, id)
    }
    async delete({id}){

        return await this.model.delete(id)
    }
}

module.exports = { KsmFactory }