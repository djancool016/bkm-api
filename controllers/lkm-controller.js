const {middlewareRequest} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

function createLkm(req, res, next){

    let allowedKey = {
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    next()
}

function readLkm(req, res, next){

    let allowedKey = {
        integer: ['id'],
        string: ['name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}

function updateLkm(req, res, next){

    let allowedKey = {
        integer: ['id'],
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole,  factory.update(req.body))
    next()
}

function deleteLkm(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]
    
    req.result = middlewareRequest(req, res, allowedKey, allowedRole,  factory.delete(req.body))
    next()
}

module.exports = {
    create: createLkm,
    read: readLkm,
    update: updateLkm,
    delete: deleteLkm
}