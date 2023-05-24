const {middlewareRequest} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

async function createLkm(req, res, next){

    let allowedKey = {
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result

    if(status) return next()
    res.status(code).json(req.result)
}

async function readLkm(req, res, next){

    let allowedKey = {
        integer: ['id'],
        string: ['name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    req.lkm = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function updateLkm(req, res, next){

    let allowedKey = {
        integer: ['id'],
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    let{status, code} = req.result

    if(status) return next()
    res.status(code).json(req.result)
}

async function deleteLkm(req, res, next){
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
    create: createLkm,
    read: readLkm,
    update: updateLkm,
    delete: deleteLkm
}