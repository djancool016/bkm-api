const {middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

async function create(req, res, next){

    if(!req.isApproved) return next()

    let model = factory.create({
        loan: req.loan,
        ksm: req.ksm
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.loanPayment = result
    return next()
}

async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.loanPayment = result
    return next()
}

async function update(req, res, next){

    let model = factory.updatePayment({
        loanPayment: req.loanPayment,
        loan: req.loan,
        transaction: req.transaction
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

module.exports = {create, read, update}