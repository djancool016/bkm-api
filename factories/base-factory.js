const { StatusLogger, DataLogger } = require('../utils')

async function sequelizeGetRequest(model){
    try {
        let result = await model
        if(result) return new DataLogger({data: result}).log
        return new StatusLogger({code: 404}).log
    } catch (error) {
        if(error.message.includes('datatype mismatch')) return new StatusLogger({code: 400}).log
        console.log(error)
        return new StatusLogger({code: 500}).log
    }
}

async function sequelizePostRequest(model, message, code){
    try {
        let result = await model
        if(result.id || result > 0 || result[1] > 0) return new StatusLogger({code: code, message: message}).log
        return new StatusLogger({code: 404}).log
    } catch (error) {
        if(error.message.includes('datatype mismatch')) return new StatusLogger({code: 400}).log
        console.log(error)
        return new StatusLogger({code: 500}).log
    }
}

class BaseModel {
    constructor(model){
        this.model = model
        this.query = {}
    }
    async findAll(newQuery = null){
        let query = newQuery ? newQuery : this.query
        return sequelizeGetRequest(this.model.findAll(query))
    }
    async findByPk(id, newQuery = null){
        let query = newQuery ? newQuery : this.query
        return sequelizeGetRequest(this.model.findByPk(id, query))
    }
    async findOne(newQuery = null){
        let query = newQuery ? newQuery : this.query
        return sequelizeGetRequest(this.model.findOne(query))
    }
    async create(obj){
        try {
            let result = await this.model.create(obj)
            console.log(result)
            if(result.id) return new StatusLogger({code: 201, message: "Create Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.message.includes('datatype mismatch')) return new StatusLogger({code: 400}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
    async update(obj, id){
        try {
            let result = await this.model.update(obj, {where: {id: id}, returning: true })
            if(result[1]) return new StatusLogger({code: 200, message: "Update Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.message.includes('datatype mismatch')) return new StatusLogger({code: 400}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
    async delete(id){
        try {
            let result = await this.model.destroy({where: {id: id}, returning: true})
            if(result) return new StatusLogger({code: 200, message: "Delete Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.message.includes('datatype mismatch')) return new StatusLogger({code: 400}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
}

module.exports = { BaseModel }

