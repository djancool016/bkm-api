const {BaseModel} = require('./base-factory')
const {StatusLogger, DataLogger} = require('../utils')
const model = require('../models')
const {Op} = require('sequelize')


class LedgerModel extends BaseModel {
    constructor(){
        super()
        this.model = model.typeTransactionRule
        this.query = {
            attributes: [],
            include: [
                {
                    model: model.typeTransaction,
                    as: 'type',
                },{
                    model: model.Coa,
                    as: 'coa',
                    attributes: ['id', 'description'],
                    include: [
                        {
                            model: model.Account,
                            as: 'account',
                            attributes:['id', 'name'],
                            include: [
                                {
                                    model: model.Category,
                                    as: 'category',
                                    attributes: ['id', 'name']
                                }
                            ]
                        }
                    ]
                },{
                    model: model.Register,
                    as: 'register'
                }
            ]
        }
    }
    findByIdType(id_type){
        this.query.where = {id_type}
        return this.findAll()
    }
}

class LedgerFactory {
    constructor(){
        this.model = new LedgerModel
    }

    async read({transaction}){

        if(!transaction || transaction.status == false) return transaction

        if(Array.isArray(transaction.data) == false){
            transaction.data = [transaction.data]
        }
        let result = []

        for(let i = 0; i < transaction.data.length ; i++){

            let {id:id_transaction, id_type, total, remark} = transaction.data[i]

            let ledger = await this.model.findByIdType(id_type)
            if(ledger.status == false) return ledger

            ledger.data.forEach(data => {
                let{
                    id:id_coa, 
                    account: {id:id_account, name, category},
                } = data.coa

                let{register:{id:id_register, name: registerName}} = data

                let transaction = {
                    id_coa,
                    id_register,
                    register: registerName,
                    id_transaction,
                    total,
                    remark
                }
                let account = {
                    id: id_account,
                    name,
                    transaction: [transaction]
                }
                let body = {
                    category,
                    account:[account]
                }

                let indexCategory = result.findIndex(item => item.category.id == category.id)
                if(indexCategory === -1) return result.push(body)  

                let indexAccount = result[indexCategory].account.findIndex(item => item.id == id_account)
                if(indexAccount === -1) return result[indexCategory].account.push(account)

                result[indexCategory].account[indexAccount].transaction.push(transaction)
                result[indexCategory].account.sort((a,b) => a.id - b.id)
               
            })
        }

        return new DataLogger({data: result}).log
    }
}

module.exports = {LedgerFactory}