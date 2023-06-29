const {middlewareRequest, bulkRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const { StatusLogger } = require('../utils')
const factory = new LoanFactory

async function create(req, res, next){
    
    let model = factory.create({
        loan: req.loan,
        ksm: req.ksm,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.loan = result
    return next()
}

async function creates(req, res, next){

    let url = 'http://localhost:5100/loan'
    let {loans} = req.body

    let result = await bulkRequest(loans, url)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}


async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)

    req.result = result
    req.loan = result
    return next()
}

async function update(req, res, next){

    let model = factory.update({
        loan: req.loan,
        ksm: req.ksm,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

async function destroy(req, res, next){

    let model = factory.delete({loan: req.loan})
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

async function approve(req, res, next){

    if(!req.body.loan_start) {
        req.isApproved = new StatusLogger({code: 400, message:'Loan Start is empty'}).log
        return next()
    }

    let model = factory.loanApproval({
        loan: req.loan,
        loan_start: req.body.loan_start,
        ksm: req.ksm
    })  
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.isApproved = result
    return next()
}

module.exports = {create, creates, read, update, destroy, approve}