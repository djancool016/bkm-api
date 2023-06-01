const {middlewareRequest} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

async function create(req, res, next){

    let allowedKey = {
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result

    if(status) return next()
    res.status(code).json(req.result)
}

async function read(req, res, next){

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

async function update(req, res, next){

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

async function destroy(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]
    
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result

    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {create, read, update, destroy
}