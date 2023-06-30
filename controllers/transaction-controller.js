const {middlewareRequest, bulkRequest} = require('./base-controller')
const {TransactionFactory} = require('../factories/transaction-factory')
const { DateFormat } = require('../utils')
const factory = new TransactionFactory

async function create(req, res, next){
    
    let model = factory.create({
        typeTransaction: req.typeTransaction,
        lkm: req.lkm,
        requestBody: req.body,
        loan: req.loan,
        ksm: req.ksm
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.transaction = result
    return next()
}
async function creates(req, res, next){

    let url = 'http://localhost:5100/api/transaction'
    let {transactions} = req.body

    let result = await bulkRequest(transactions, url)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}
async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)

    req.result = result
    req.transaction = result

    if(req.body.start_date){
        let lastMonth = new DateFormat(req.body.start_date)
        lastMonth.addDays = -1
        lastMonth = lastMonth.toISOString(false)

        let newReqBody = {...req.body}
        delete newReqBody.start_date
        newReqBody.end_date = lastMonth

        model = factory.read(newReqBody)
        result = await middlewareRequest(req, res, model)

        req.lastMonthTransaction = result
    }

    return next()
}
async function update(req, res, next){

    let model = factory.update(req.body)
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}
async function destroy(req, res, next){
    
    let model = factory.delete(req.body)
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    return next()
}

module.exports = {create, creates, read, update, destroy}