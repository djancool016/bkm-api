const {middlewareRequest} = require('./base-controller')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const factory = new LoanPaymentFactory

async function read(req, res, next){

    let model = factory.read({
        loan: req.loan,
        transactionLoan: req.transactionLoan,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.loanPayment = result
    return next()
}

module.exports = {read}