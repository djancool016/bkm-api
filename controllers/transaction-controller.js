const {BaseController, RequestValidator} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const {TransactionLoanFactory} = require('../factories/transactionLoan-factory')
const {StatusLogger} = require('../utils/logger')
const factory = new TransactionFactory
const transactionLoan = new TransactionLoanFactory

function createTransaction(req, res){

    let allowedKey = {
        integer: ['id_loan', 'id_lkm', 'id_coa', 'total'],
        string: ['remark'],
        date: ['trans_date']
    }
    new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.create(req.body))
    controller.sendRequest()
}
function readTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'id_account', 'id_register'],
        string: ['trans_code'],
        boolean: ['findLatest']
    }
    new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.read(req.body))
    controller.sendRequest()
}
function updateTransaction(req, res){

    let allowedKey = {
        integer: ['id', 'id_coa', 'total'],
        date: ['trans_date'],
        string: ['remark']
    }
    new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.update(req.body))
    controller.sendRequest()
}
function deleteTransaction(req, res){

    let controller = new BaseController(req, res, factory.delete(req.params.id))
    controller.sendRequest()
}

module.exports = {
    create: createTransaction,
    read: readTransaction,
    update: updateTransaction,
    delete: deleteTransaction
}