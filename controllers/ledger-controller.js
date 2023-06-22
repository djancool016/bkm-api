const {middlewareRequest} = require('./base-controller')
const {LedgerFactory} = require('../factories/ledger-factory')
const factory = new LedgerFactory

async function read(req, res, next){

    let model = factory.read({
        transaction: req.transaction
    })
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.ledger = result
    return next()
}

module.exports = {
    read
}