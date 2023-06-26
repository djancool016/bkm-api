const router = require('express').Router()
const user = require('./controllers/user-controller')
const transaction = require('./controllers/transaction-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Transaction route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.transaction.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, typeTransaction.read ,transaction.create, endRequest
)
router.post('/bulk', 
    (req, res, next) => validator(req, res, next, input.transaction.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.creates, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.transaction.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, endRequest
)
router.put('/', 
    (req, res, next) => validator(req, res, next, input.transaction.update), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.update, endRequest
)
router.delete('/', 
    (req, res, next) => validator(req, res, next, input.transaction.destroy), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.destroy, endRequest
)
