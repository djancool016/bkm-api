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

            //object ledger menentukan jenis Account, COA dan Register suatu transaksi
            ledger.data.forEach(data => {
                let{
                    id:id_coa, 
                    account: {id:id_account, name, category},
                    description
                } = data.coa

                let{register:{id:id_register, name: registerName}} = data

                let transaction = {
                    id_coa,
                    coa: description,
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

                // Mencari index Category transaksi dari objek 'result'
                let indexCategory = result.findIndex(item => item.category.id == category.id)
                if(indexCategory === -1) return result.push(body)  

                // Apabila index Category ditemukan kemudian mencari index Account
                let indexAccount = result[indexCategory].account.findIndex(item => item.id == id_account)
                if(indexAccount === -1) return result[indexCategory].account.push(account)

                // Apabila index Account ditemukan maka akan diisi dengan object transaksi
                result[indexCategory].account[indexAccount].transaction.push(transaction)
                // Mengurutkan object transaksi berdasarkan Account ID
                result[indexCategory].account.sort((a,b) => a.id - b.id)
            })
        }

        return new DataLogger({data: result}).log
    }
    // BBNS = Buku Besar Neraca dan Saldo
    async readBbns({ledgers}){

        if(!ledgers || ledgers.status == false) {
            return ledgers || new StatusLogger({code: 404, message: 'Ledger not found'}).log
        }

        const aktiva = []
        const pasiva = []

        ledgers.data.forEach(ledger => {
            const {category:{id: id_category}, account} = ledger
            switch(id_category){
                case 1:
                    account.forEach(({id:id_account, name: name_account, transaction}) => {
                        fillLedger(aktiva, id_account, name_account, transaction)
                    })
                    break
                case 2:
                    account.forEach(({id:id_account, name: name_account, transaction}) => {
                        fillLedger(pasiva, id_account, name_account, transaction)
                    })
                    break
                default:
                    break
            }         
        })
        return new DataLogger({data: {assets, liabilities}}).log
    }
}

function fillLedger (arr, id_account, name_account, transaction) {
    transaction.forEach(({id_coa, coa, id_register, total}) => {

        const dc = () => {
            switch(id_register){
                case 1:
                    return {debit: total, credit: 0}
                case 2:
                    return {debit: 0, credit: total}
                default:
                    return {debit: 0, credit: 0}
            }
        }
        const {debit, credit} = dc()
        const index = arr.findIndex(item => item.id_coa === id_coa)
        if(index === -1) return arr.push({id_coa, coa, id_account, account: name_account, debit, credit})
        
        arr[index].debit += debit
        arr[index].credit += credit
    })
}

module.exports = {LedgerFactory}