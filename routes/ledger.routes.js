const router = require('express').Router()
const user = require('../controllers/user-controller')
const ledger = require('../controllers/ledger-controller')
const transaction = require('../controllers/transaction-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Loan Payment route
router.get('/', 
    (req, res, next) => validator(req, res, next, input.ledger.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, ledger.read, endRequest
)
router.get('/bbns', 
    (req, res, next) => validator(req, res, next, input.ledger.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, ledger.read, ledger.readBbns, endRequest
)

module.exports = router