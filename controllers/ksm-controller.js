const {BaseController, RequestValidator} = require('./base-controller')
const {KsmFactory} = require('../factories/ksm-factory')
const factory = new KsmFactory

function createKsm(req, res){

    let allowedKey = {
        integer: ['id_lkm', 'rw'],
        string: ['name']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.create(req.body))

    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function readKsm(req, res){

    let allowedKey = {
        integer: ['id','id_lkm'],
        boolean: ['findLatest'],
        string: ['name']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.read(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function updateKsm(req, res){

    let allowedKey = {
        integer: ['id','id_lkm','rw'],
        string: ['name']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.update(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

function deleteKsm(req, res){
    let allowedKey = {
        integer: ['id']
    }
    let validator = new RequestValidator(req.body, res, allowedKey).sendResponse
    let controller = new BaseController(req, res, factory.delete(req.body))
    
    if(validator.status) return controller.sendRequest()
    return res.status(validator.code).json(validator)
}

module.exports = {
    create: createKsm,
    read: readKsm,
    update: updateKsm,
    delete: deleteKsm
}


