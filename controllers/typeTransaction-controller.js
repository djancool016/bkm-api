const {middlewareRequest} = require('./base-controller')
const {TypeTransactionFactory} = require('../factories/typeTransaction-factory')
const factory = new TypeTransactionFactory

async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.typeTransaction = result
    return next()
}

module.exports = {
    read
}