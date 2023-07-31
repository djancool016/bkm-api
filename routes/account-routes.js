const router = require('express').Router()
const user = require('../controllers/user-controller')
const {input} = require('../routes-allowedKey')
const account = require('../controllers/account-controller')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Account route
router.get('/', 
    (req, res, next) => validator(req, res, next, input.account.read), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    account.read, endRequest
)

module.exports = router