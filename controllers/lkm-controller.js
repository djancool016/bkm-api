const {BaseController, RequestValidator} = require('./base-controller')
const {LkmFactory} = require('../factories/lkm-factory')
const factory = new LkmFactory

function createLkm(req, res){

    let allowedKey = {
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.create(req.body))

    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function readLkm(req, res){

    let allowedKey = {
        integer: ['id'],
        string: ['name'],
        boolean: ['findLatest']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.read(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function updateLkm(req, res){

    let allowedKey = {
        integer: ['id'],
        string: ['id_kelurahan', 'name', 'phone', 'address']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.update(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function deleteLkm(req, res){
    let allowedKey = {
        integer: ['id']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.delete(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

module.exports = {
    create: createLkm,
    read: readLkm,
    update: updateLkm,
    delete: deleteLkm
}