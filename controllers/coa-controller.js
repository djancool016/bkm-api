const {baseRequest} = require('./base-controller')
const {CoaFactory} = require('../factories/coa-factory')
const factory = new CoaFactory

function createCoa(req, res){

    let allowedKey = {
        integer: ['id_register', 'id_account'],
        string: ['description']
    }
    return baseRequest(req, res, allowedKey, factory.create(req.body))
}

function readCoa(req, res){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        boolean: ['findLatest']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}

function updateCoa(req, res){

    let allowedKey = {
        integer: ['id','id_register', 'id_account'],
        string: ['description']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}

function deleteCoa(req, res){
    let allowedKey = {
        integer: ['id']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}

module.exports = {
    create: createCoa,
    read: readCoa,
    update: updateCoa,
    delete: deleteCoa
}


