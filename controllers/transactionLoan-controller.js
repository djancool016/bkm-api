const {middlewareRequest, bulkRequest} = require('./base-controller')
const {TransactionLoanFactory} = require('../factories/transactionLoan-factory')
const factory = new TransactionLoanFactory

async function create (req, res, next){

    let model = factory.create({
        loan: req.loan,
        transaction: req.transaction
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.transactionLoan = result
    return next()
}

async function creates (req, res, next){
    
    let url = 'http://localhost:5100/transactionLoan'
    let {transactionLoans} = req.body

    let result = await bulkRequest(transactionLoans, url)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model) 

    req.result = result
    req.transactionLoan = result
    return next()
}

async function check(req, res, next){

    let model = factory.checkPayments({
        loan: req.loan,
        requestBody: req.body,
        transactionLoan: req.transactionLoan,
        loanPayment: req.loanPayment
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)
    
    req.result = result
    req.transactionStatus = result
    return next()
}

module.exports = {create, creates, read, check}
