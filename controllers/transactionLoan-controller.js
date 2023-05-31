const {middlewareRequest} = require('./base-controller')
const {TransactionLoanFactory} = require('../factories/transactionLoan-factory')
const { StatusLogger } = require('../utils')
const factory = new TransactionLoanFactory

async function create (req, res, next){

    let allowedKey = {}
    let allowedRole = [1, 2]
    let model = factory.create({
        loan: req.loan,
        transaction: req.transaction
    })

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code, data} = req.result
    req.transactionLoan = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function read(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_transaction', 'id_loan','id_ksm']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{code, data} = req.result
    if(code == 404) req.result.message = 'LoanPayment not found'
    req.transactionLoan = data
    
    return next()
}

async function check(req, res, next){
    let allowedKey = {}
    let allowedRole = [1, 2]
    let model = factory.checkPayments({
        loan: req.loan,
        transaction: req.body,
        transactionLoan: req.transactionLoan,
        loanPayment: req.loanPayment
    })

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {create, read, check}
