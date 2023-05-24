const {middlewareRequest} = require('./base-controller')
const {CoaFactory} = require('../factories/coa-factory')
const factory = new CoaFactory

function createCoa(req, res, next){

    let allowedKey = {
        integer: ['id_register', 'id_account'],
        string: ['description']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    next()
}

function readCoa(req, res, next){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}

function updateCoa(req, res, next){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        string: ['description']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    next()
}

function deleteCoa(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    next()
}

module.exports = {
    create: createCoa,
    read: readCoa,
    update: updateCoa,
    delete: deleteCoa
}


