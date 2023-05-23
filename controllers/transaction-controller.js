const {baseRequest} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const factory = new TransactionFactory

function createTransaction(req, res){

    let allowedKey = {
        integer: ['id_loan', 'id_lkm', 'id_coa', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    return baseRequest(req, res, allowedKey, factory.create(req.body))
}
function readTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'id_account', 'id_register'],
        string: ['trans_code'],
        boolean: ['findLatest']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}
function updateTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'total'],
        date: ['trans_date'],
        string: ['remark']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}
function deleteTransaction(req, res){
    let allowedKey = {
        integer: ['id']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}

module.exports = {
    create: createTransaction,
    read: readTransaction,
    update: updateTransaction,
    delete: deleteTransaction
}