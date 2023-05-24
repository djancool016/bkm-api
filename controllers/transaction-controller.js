const {middlewareRequest, RequestValidator} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const { StatusLogger } = require('../utils')
const factory = new TransactionFactory

function isLoan(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'id_coa', 'id_loan', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }

    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    req.result = validator

    let{id_coa, id_loan} = req.body

    if(!id_loan){
        req.result = new StatusLogger({code: 400, message:"Empty Loan ID"}).log
        return res.status(req.result.code).json(req.result)
    }
    if(id_coa > 2 ){
        req.result = new StatusLogger({code: 400, message:"Coa not for a loan transaction"}).log
        return res.status(req.result.code).json(req.result)
    }

    return next()
}

async function createTransaction(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'id_coa', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    let allowedRole = [1, 2]

    let{id_coa, id_loan} = req.body
    if((id_coa == 1 || id_coa == 2) && !id_loan){
        req.result = new StatusLogger({code: 400, message:"Empty Loan ID"}).log
        return res.status(req.result.code).json(req.result)
    }

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    next()
}
function readTransaction(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_coa', 'id_account', 'id_register'],
        string: ['trans_code'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}
function updateTransaction(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_coa', 'total'],
        date: ['trans_date'],
        string: ['remark']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    next()
}
function deleteTransaction(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    next()
}

module.exports = {
    create: createTransaction,
    read: readTransaction,
    update: updateTransaction,
    delete: deleteTransaction,
    isLoan
}