const {middlewareRequest} = require('./base-controller')
const {KsmFactory} = require('../factories/ksm-factory')
const factory = new KsmFactory

function createKsm(req, res, next){

    let allowedKey = {
        integer: ['id_lkm', 'rw'],
        string: ['name']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    next()
}

function readKsm(req, res, next){

    let allowedKey = {
        integer: ['id','id_lkm'],
        boolean: ['findLatest'],
        string: ['name']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}

function updateKsm(req, res, next){

    let allowedKey = {
        integer: ['id','id_lkm','rw'],
        string: ['name']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    next()
}

function deleteKsm(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    next()
}

module.exports = {
    create: createKsm,
    read: readKsm,
    update: updateKsm,
    delete: deleteKsm
}


