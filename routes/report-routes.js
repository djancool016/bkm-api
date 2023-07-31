const router = require('express').Router()
const user = require('../controllers/user-controller')
const lkm = require('../controllers/lkm-controller')
const loan = require('../controllers/loan-controller')
const transaction = require('../controllers/transaction-controller')
const ledger = require('../controllers/ledger-controller')
const report = require('../controllers/report-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Report route
router.get('/loan', 
    (req, res, next) => validator(req, res, next, input.report.loan), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, loan.read, report.loanReports, endRequest
)
// Report route
router.get('/cash', 
    (req, res, next) => validator(req, res, next, input.report.loan), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, ledger.read, report.cashReports, endRequest
)
// Report route
router.get('/bbns', 
    (req, res, next) => validator(req, res, next, input.report.loan), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, loan.read, transaction.read, ledger.read, ledger.readBbns, 
    report.loanReports, report.bbnsReports, endRequest
)
// router.get('/report/ledger', 
//     (req, res, next) => validator(req, res, next, input.transaction.read), user.auth, 
//     (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
//     transaction.read, ledger.read, endRequest
// )
// router.get('/report/cash', 
//     (req, res, next) => validator(req, res, next, input.report.payment), user.auth, 
//     (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
//     transaction.read, ledger.read, report.cashReport, endRequest
// )
router.get('/download', 
    (req, res, next) => validator(req, res, next, input.report.loan), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, loan.read, transaction.read, ledger.read, ledger.readBbns, 
    report.loanReports, report.reportXls, endRequest
)

module.exports = router
