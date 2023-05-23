const {baseRequest, middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

function createLoanPayment(req, res){

    let allowedKey = {
        integer: ['id_loan']
    }
    let {code, status} = req.result
    if(status == false) return res.status(code).json(req.result)

    return baseRequest(req, res, allowedKey, factory.create({id_loan: req.body.id}))
}
function readLoanPayment(req, res){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'id_loan']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}
function updateLoanPayment(req, res){

    let allowedKey = {
        integer: ['id_loan','pay_loan','pay_interest']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}
function deleteLoanPayment(req, res){
    let allowedKey = {
        integer: ['id_loan']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}

module.exports = {
    create: createLoanPayment,
    read: readLoanPayment,
    update: updateLoanPayment,
    delete: deleteLoanPayment
}