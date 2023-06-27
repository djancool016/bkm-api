const router = require('express').Router()
const user = require('../controllers/user-controller')
const loan = require('../controllers/loan-controller')
const loanPayment = require('../controllers/loanPayment-controller')
const transactionLoan = require('../controllers/transactionLoan-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Loan Payment route
router.get('/', 
    (req, res, next) => validator(req, res, next, input.loanPayment.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    loan.read, transactionLoan.read, loanPayment.read, endRequest
)

module.exports = router