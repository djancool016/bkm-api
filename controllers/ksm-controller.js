const {baseRequest} = require('./base-controller')
const {KsmFactory} = require('../factories/ksm-factory')
const factory = new KsmFactory

function createKsm(req, res){

    let allowedKey = {
        integer: ['id_lkm', 'rw'],
        string: ['name']
    }
    return baseRequest(req, res, allowedKey, factory.create(req.body))
}

function readKsm(req, res){

    let allowedKey = {
        integer: ['id','id_lkm'],
        boolean: ['findLatest'],
        string: ['name']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}

function updateKsm(req, res){

    let allowedKey = {
        integer: ['id','id_lkm','rw'],
        string: ['name']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}

function deleteKsm(req, res){
    let allowedKey = {
        integer: ['id']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}

module.exports = {
    create: createKsm,
    read: readKsm,
    update: updateKsm,
    delete: deleteKsm
}


