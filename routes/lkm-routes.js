const router = require('express').Router()
const user = require('./controllers/user-controller')
const lkm = require('./controllers/lkm-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// LKM route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.lkm.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.create, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.lkm.read), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, endRequest
)
router.put('/', 
    (req, res, next) => validator(req, res, next, input.lkm.update), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.update, endRequest
)
router.delete('/', 
    (req, res, next) => validator(req, res, next, input.lkm.destroy), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.destroy, endRequest
)
