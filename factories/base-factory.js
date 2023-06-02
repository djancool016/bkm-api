const { StatusLogger, DataLogger } = require('../utils')

async function sequelizeGetRequest(model){
    try {
        let result = await model
        if(result) return new DataLogger({data: result}).log
        return new StatusLogger({code: 404}).log
    } catch (error) {
        if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
        console.log(error.message)
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
            if(result.id) return new DataLogger({data: result, code: 201, message: "Create Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
            if(error.original?.code.includes('ER_DUP_ENTRY')) return new StatusLogger({code: 400, message:'Unique identifier is already in use'}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
    async bulkCreate(arr){
        try {
            let result = await this.model.bulkCreate(arr)
            if(result) return new DataLogger({data: result, code: 201, message: "Create Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
            if(error.original?.code.includes('ER_DUP_ENTRY')) return new StatusLogger({code: 400, message:'Unique identifier is already in use'}).log
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
            if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
            if(error.original?.code.includes('ER_DUP_ENTRY')) return new StatusLogger({code: 400, message:'Unique identifier is already in use'}).log
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
            if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
            if(error.original?.code.includes('ER_ROW_IS_REFERENCED')) return new StatusLogger({code: 400, message:'Foreign key constraint fails'}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
    async bulkDelete(newQuery = {}){
        try {
            newQuery.returning = true
            let result = await this.model.destroy(newQuery)
            if(result) return new StatusLogger({code: 200, message: "Delete Successfull"}).log
            return new StatusLogger({code: 404}).log
        } catch (error) {
            if(error.original?.code.includes('WRONG_VALUE_FOR_FIELD')) return new StatusLogger({code: 400, message:'Datatype mismatch'}).log
            if(error.original?.code.includes('ER_ROW_IS_REFERENCED')) return new StatusLogger({code: 400, message:'Foreign key constraint fails'}).log
            console.log(error)
            return new StatusLogger({code: 500}).log
        }
    }
}

module.exports = { BaseModel }

