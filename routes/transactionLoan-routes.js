const router = require('express').Router()
const user = require('../controllers/user-controller')
const lkm = require('../controllers/lkm-controller')
const loan = require('../controllers/loan-controller')
const transaction = require('../controllers/transaction-controller')
const typeTransaction = require('../controllers/typeTransaction-controller')
const transactionLoan = require('../controllers/transactionLoan-controller')
const loanPayment = require('../controllers/loanPayment-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Transaction Loan route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.transactionLoan.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, typeTransaction.read, loan.read, loanPayment.read, transactionLoan.read, 
    transactionLoan.validator, transaction.create, 
    transactionLoan.create, endRequest
)
router.post('/bulk', 
    (req, res, next) => validator(req, res, next, input.transactionLoan.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transactionLoan.creates, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.transactionLoan.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transactionLoan.read, endRequest
)

// Transaction LIB route
router.post('/lib', 
    (req, res, next) => validator(req, res, next, input.transactionLIB.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transactionLoan.createLIB, endRequest
)
router.post('/lib/bulk', 
    (req, res, next) => validator(req, res, next, input.transactionLIB.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transactionLoan.createLIBs, endRequest
)

module.exports = router