const {middlewareRequest} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

async function create(req, res, next){

    let model = factory.create(req.body)
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.lkm = result
    return next()
}

async function read(req, res, next){

    let model = factory.read(req.body)
    let result = await middlewareRequest(req, res, model)

    req.result = result
    req.lkm = result
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

module.exports = {create, read, update, destroy}