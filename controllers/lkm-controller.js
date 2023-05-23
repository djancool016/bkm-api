const {baseRequest} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

function createLkm(req, res){

    let allowedKey = {
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    return baseRequest(req, res, allowedKey, factory.create(req.body))
}

function readLkm(req, res){

    let allowedKey = {
        integer: ['id'],
        string: ['name'],
        boolean: ['findLatest']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}

function updateLkm(req, res){

    let allowedKey = {
        integer: ['id'],
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}

function deleteLkm(req, res){
    let allowedKey = {
        integer: ['id']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}

module.exports = {
    create: createLkm,
    read: readLkm,
    update: updateLkm,
    delete: deleteLkm
}