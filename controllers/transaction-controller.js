const {BaseController, RequestValidator} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const factory = new TransactionFactory

function createTransaction(req, res){

    let allowedKey = {
        integer: ['id_loan', 'id_lkm', 'id_coa', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.create(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}
function readTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'id_account', 'id_register'],
        string: ['trans_code'],
        boolean: ['findLatest']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.read(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}
function updateTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'total'],
        date: ['trans_date'],
        string: ['remark']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.update(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}
function deleteTransaction(req, res){
    let allowedKey = {
        integer: ['id']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.delete(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

module.exports = {
    create: createTransaction,
    read: readTransaction,
    update: updateTransaction,
    delete: deleteTransaction
}