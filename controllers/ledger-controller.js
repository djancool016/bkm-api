const {middlewareRequest, bulkRequest} = require('./base-controller')
const {LedgerFactory} = require('../factories/ledger-factory')
const factory = new LedgerFactory

async function read(req, res, next){

    let model = factory.read({
        transaction: req.transaction,
        lastMonthTransaction: req.lastMonthTransaction
    })
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.ledger = result
    return next()
}

async function readBbns(req, res, next){

    let model = factory.readBbns({
        ledgers: req.ledger
    })
    let result = await middlewareRequest(req, res, model)
    
    req.result = result
    req.bbns = result
    return next()
}

module.exports = {
    read, readBbns
}