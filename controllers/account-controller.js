const {middlewareRequest} = require('./base-controller')
const {AccountFactory} = require('../factories/account-factory')
const factory = new AccountFactory

async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)

    req.result = result
    req.coa = result
    return next()
}

module.exports = {read}