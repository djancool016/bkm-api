const {middlewareRequest} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const { StatusLogger } = require('../utils')
const factory = new TransactionFactory

async function create(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'id_coa', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code, data} = req.result
    req.transaction = data
    
    if(status) return next()
    res.status(code).json(req.result)
}
async function read(req, res, next){

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
async function update(req, res, next){

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
async function destroy(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {create, read, update, destroy}