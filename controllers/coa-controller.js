const {middlewareRequest} = require('./base-controller')
const {CoaFactory} = require('../factories/coa-factory')
const factory = new CoaFactory

async function createCoa(req, res, next){

    let allowedKey = {
        integer: ['id_register', 'id_account'],
        string: ['description']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function readCoa(req, res, next){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    req.coa = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function updateCoa(req, res, next){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        string: ['description']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function deleteCoa(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {
    create: createCoa,
    read: readCoa,
    update: updateCoa,
    delete: deleteCoa
}


