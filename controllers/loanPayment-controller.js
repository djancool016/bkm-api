const {middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

async function createLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function readLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'id_loan']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    req.loanPayment = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function updateLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id_loan','pay_loan','pay_interest']
    }
    let allowedRole = [1, 2]
    
    // id_coa is from previous middleware
    if(!req.body?.id_coa) res.status(400).json(req.result)

    switch(req.body?.id_coa){
        case 1:
            req.body.pay_loan = req.body.total
            break
        case 2:
            req.body.pay_interest = req.body.total
            break
    }
    
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.payment(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function deleteLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {
    create: createLoanPayment,
    read: readLoanPayment,
    update: updateLoanPayment,
    delete: deleteLoanPayment
}