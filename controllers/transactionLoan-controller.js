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

async function createBop (req, res, next){

    let model = factory.createBop({
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

async function createBops (req, res, next){

    let url = 'http://localhost:5100/transactionBop'
    let {transactionBops} = req.body

    let result = await bulkRequest(transactionBops, url)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

// create transaction loan, interest and BOP
async function createLIB (req, res, next){

    let result = await bulkRequest(await factory.createLIB(req.body))
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

async function createLIBs (req, res, next){

    let url = 'http://localhost:5100/transactionLIB'
    let {transactionLIBs} = req.body

    let result = await bulkRequest(transactionLIBs, url)
    if(!result.data?.okResponse) return res.status(result.code).json(result)

    let {badResponses, okResponses} = nestedResponse(result.data)
    
    if(badResponses.length > 0 && okResponses.length > 0) {
        result.message = `${okResponses.length} requests is proceed, ${badResponses.length} requests is failed to process`
        result.data = {okResponses, badResponses}
    }
    else if(badResponses.length > 0 && okResponses.length == 0){
        result.message = `All ${badResponses.length} requests failed to process`
        result.data = {badResponses}
    }
    else{
        result.message = `All ${okResponses.length} requests is proceed`
        result.data = {okResponses}
    }

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

async function checkBop(req, res, next){
    let model = factory.checkBop({
        loan: req.loan,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)
    
    return next()
}

function nestedResponse ({okResponse}){

    let okResponses = []
    let badResponses = []

    if(okResponse){
        okResponse.forEach( ({data}) => {
            if(data?.okResponse){
                data.okResponse.forEach( response => {
                    okResponses.push(response)
                })  
            }
            if(data?.badResponse){
                data.badResponse.forEach( response => {
                    badResponses.push(response)
                })
            }
        })
    }
    return {okResponses, badResponses}
}

module.exports = {create, creates, read, check, checkBop, createBop, createBops, createLIB, createLIBs}
