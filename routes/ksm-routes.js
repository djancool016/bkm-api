const router = require('express').Router()
const user = require('./controllers/user-controller')
const ksm = require('./controllers/ksm-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// KSM route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.ksm.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.create, endRequest
)
router.post('/bulk', 
    (req, res, next) => validator(req, res, next, input.ksm.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.creates, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.ksm.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.read, endRequest
)
router.put('/', 
    (req, res, next) => validator(req, res, next, input.ksm.update), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.update, endRequest
)
router.delete('/', 
    (req, res, next) => validator(req, res, next, input.ksm.destroy), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.destroy, endRequest
)