const {middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

async function createLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    let {status} = await req.result
    if(status){
        let result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
        req.result = result
        return next()
    }
    return next()
}
function readLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'id_loan']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}
async function updateLoanPayment(req, res, next){

    let allowedKey = {
        integer: ['id_loan','pay_loan','pay_interest']
    }
    let allowedRole = [1, 2]

    let {id_coa} = req.body
    if (!id_coa) return next()
    
    switch(Number(id_coa)){
        case 1:
            req.body.pay_loan = req.body.total
            break
        case 2:
            req.body.pay_interest = req.body.total
            break
    }
    
    let {status} = await req.result
    if(status){
        let result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.payment(req.body))
        req.result = result
        return next()
    }
    return next()
}
function deleteLoanPayment(req, res, next){
    let allowedKey = {
        integer: ['id_loan']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    next()
}

module.exports = {
    create: createLoanPayment,
    read: readLoanPayment,
    update: updateLoanPayment,
    delete: deleteLoanPayment
}