const router = require('express').Router()
const user = require('./controllers/user-controller')
const coa = require('./controllers/coa-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Coa route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.coa.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.create, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.coa.read), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.read, endRequest
)
router.put('/', 
    (req, res, next) => validator(req, res, next, input.coa.update), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.update, endRequest
)
router.delete('/', 
    (req, res, next) => validator(req, res, next, input.coa.destroy), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.destroy, endRequest
)