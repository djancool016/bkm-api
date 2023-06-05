const {BaseModel} = require('./base-factory')
const {StatusLogger, DateFormat} = require('../utils')
const model = require('../models')

class SavingModel extends BaseModel{
    constructor(){
        super()
        this.model = model.Saving
        this.query.include = [
            {
                model: model.Ksm,
                as:"ksm",
                attributes: ['id','name'],
                include: [
                    {
                        model: model.Lkm,
                        as:"lkm",
                        attributes: ['id', 'name']
                    }
                ]
            }
        ]
    }
    findLatestOne(){
        this.query.order = [['updated_at','DESC']]
        return this.findOne()
    }
    findByKsmId(id_ksm){
        this.query.where = {id_ksm: id_ksm}
        return this.findAll()
    }
    findByLkmId(id_lkm){
        this.query.where = {'$ksm.lkm.id$': id_lkm}
        return this.findAll()
    }
}

class SavingFactory {
    constructor(){
        this.model = new SavingModel()
    }
    async create({ksm, requestBody:{opening_date}}){

        if(ksm.status == false) return ksm

        opening_date = new DateFormat(opening_date).toISOString(false)
        if(opening_date == 'Invalid date') return new StatusLogger({code: 400, message:'Invalid Date Format'}).log

        let body = {
            id_ksm: ksm.data.id,
            opening_date
        }
        let result = await this.model.create(body)
        result.message = `(KSM ${ksm.data.name}) ${result.message}`
        return result
    }

    async read({id, id_saving, id_ksm, id_lkm, findLatest = false}){

        let result

        if(id_saving || id){
            result = this.model.findByPk(id_saving || id)
        }
        else if(id_ksm){
            result = this.model.findByKsmId(id_ksm)
        }
        else if(id_lkm){
            result = this.model.findByLkmId(id_lkm)
        }
        else if(findLatest){
            result = this.model.findLatestOne()
        }

        if(result.status) return result
        return new StatusLogger({code: 404, message:'Saving not found'}).log
    }

    async update({saving, requestBody: {balance, opening_date, is_valid}}){

        if(saving.status == false) return saving

        if(saving.data.is_valid == false && balance){
            return new StatusLogger({code: 400, message:'Not a valid account, cannot update balance'}).log
        }
        if(saving.data.is_valid && opening_date){
            return new StatusLogger({code: 400, message:'cannot update date on valid account'}).log
        }
        if(saving.data.is_valid && is_valid == true){
            return new StatusLogger({code: 400, message:'account already validated'}).log
        }

        let body = {
            balance,
            opening_date,
            is_valid
        }

        let result = await this.model.update(body, saving.data.id)
        result.message = `Successfully update saving account`
        if(result.status == false) result.message = `Failed to update saving account`
        return result
    }

    async delete({saving}){

        if(saving.status == false) return saving

        if(saving.data.is_valid){
            return new StatusLogger({code: 400, message:'Can not delete valid account'}).log
        }

        let result = await this.model.delete(saving.data.id)
        result.message = `Successfully delete saving account`
        if(result.status == false) result.message = `Failed to delete saving account`
        return result
    }
}