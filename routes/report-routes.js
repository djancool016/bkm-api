const router = require('express').Router()
const user = require('./controllers/user-controller')
const transaction = require('./controllers/transaction-controller')
const report = require('./controllers/report-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Report route
router.get('/report/loanPayment', 
    (req, res, next) => validator(req, res, next, input.report.prototype), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    report.paymentReport, endRequest
)
router.get('/report/ledger', 
    (req, res, next) => validator(req, res, next, input.transaction.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, ledger.read, endRequest
)
router.get('/report/cash', 
    (req, res, next) => validator(req, res, next, input.report.payment), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, ledger.read, report.cashReport, endRequest
)
router.get('/report/download', 
    (req, res, next) => validator(req, res, next, input.report.prototype), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    report.paymentReport, report.reportXls, endRequest
)
