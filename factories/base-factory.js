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
        return sequelizePostRequest(this.model.create(obj), "Create Successfull", 201)
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
        return sequelizePostRequest(this.model.destroy({where: {id: id}, returning: true}), "Delete Successfull", 200)
    }
}

module.exports = { BaseModel }

