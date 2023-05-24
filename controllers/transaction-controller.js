const {middlewareRequest} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const { StatusLogger } = require('../utils')
const factory = new TransactionFactory

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

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}
async function createTransactionLoan(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'id_coa', 'id_loan', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    let allowedRole = [1, 2]
    
    let{id_coa, id_loan} = req.body

    if(!id_loan){
        req.result = new StatusLogger({code: 400, message:"Empty Loan ID"}).log
        return res.status(req.result.code).json(req.result)
    }
    if(id_coa > 2 ){
        req.result = new StatusLogger({code: 400, message:"Coa not for a loan transaction"}).log
        return res.status(req.result.code).json(req.result)
    }

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}
async function readTransaction(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_coa', 'id_account', 'id_register'],
        string: ['trans_code'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    req.transaction = data
    
    if(status) return next()
    res.status(code).json(req.result)
}
async function updateTransaction(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_coa', 'total'],
        date: ['trans_date'],
        string: ['remark']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}
async function deleteTransaction(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {
    create: createTransaction,
    read: readTransaction,
    update: updateTransaction,
    delete: deleteTransaction,
    createTransactionLoan
}