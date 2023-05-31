const {middlewareRequest} = require('./base-controller')
const {KsmFactory} = require('../factories/ksm-factory')
const factory = new KsmFactory

async function createKsm(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'rw', 'ksms'],
        string: ['name']
    }
    let allowedRole = [1, 2]
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body), true)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function bulkCreateKsm(req, res, next){

    let allowedKey = {
        array: ['ksms']
    }
    let allowedRole = [1, 2]
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.bulkCreate(req.body), true)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function readKsm(req, res, next){

    let allowedKey = {
        integer: ['id','id_lkm'],
        boolean: ['findLatest'],
        string: ['name'],
        array: ['loans']
    }
    let allowedRole = [1, 2]

    if(req.body.loans) req.body.ksmIds = req.body.loans.map(loan => loan.id_ksm)

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    if(code == 404) req.result.message = "Ksm not found"
    
    if(Array.isArray(data)) req.ksms = data
    else req.ksm = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function updateKsm(req, res, next){

    let allowedKey = {
        integer: ['id','id_lkm','rw'],
        string: ['name']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function deleteKsm(req, res, next){
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
    create: createKsm,
    creates: bulkCreateKsm,
    read: readKsm,
    update: updateKsm,
    delete: deleteKsm
}


