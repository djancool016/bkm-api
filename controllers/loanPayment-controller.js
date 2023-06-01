const {middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

async function create(req, res, next){

    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function creates(req, res, next){

    let allowedKey = {}
    let allowedRole = [1, 2]
    let model = factory.bulkCreate({approvedIds: req.approvedIds, loans: req.loans})

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function read(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'id_loan']
    }
    let allowedRole = [1, 2]
    let model = factory.read(req.body)

    let result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    if (result.code == 404) req.result.message = 'LoanPayment not found'

    req.result = result
    req.loanPayment = result

    return next()
}

async function update(req, res, next){

    let allowedKey = {
        integer: ['id_loan','pay_loan','pay_interest']
    }
    let allowedRole = [1, 2]
    
    let model = factory.updatePayment({
        payments: req.loanPayment,
        loan: req.loan,
        transaction: req.transaction
    })
    
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function destroy(req, res, next){

    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {create, creates, read, update, destroy}