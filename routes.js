const router = require('express').Router()
const {endRequest, authorize, validator} = require('./controllers/base-controller')
const {input} = require('./routes-allowedKey')
const user = require('./controllers/user-controller')
const transaction = require('./controllers/transaction-controller')
const transactionLoan = require('./controllers/transactionLoan-controller')
const ksm = require('./controllers/ksm-controller')
const lkm = require('./controllers/lkm-controller')
const coa = require('./controllers/coa-controller')
const loan = require('./controllers/loan-controller')
const loanPayment = require('./controllers/loanPayment-controller')
const report = require('./controllers/report-controller')

// LKM route
router.post('/lkm', 
    (req, res, next) => validator(req, res, next, input.lkm.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.create, endRequest
)
router.get('/lkm', 
    (req, res, next) => validator(req, res, next, input.lkm.read), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, endRequest
)
router.put('/lkm', 
    (req, res, next) => validator(req, res, next, input.lkm.update), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.update, endRequest
)
router.delete('/lkm', 
    (req, res, next) => validator(req, res, next, input.lkm.destroy), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.destroy, endRequest
)

// KSM route
router.post('/ksm', 
    (req, res, next) => validator(req, res, next, input.ksm.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.create, endRequest
)
router.post('/ksms', user.auth, ksm.creates, endRequest)
router.get('/ksm', user.auth, ksm.read, endRequest)
router.put('/ksm', user.auth, ksm.update, endRequest)
router.delete('/ksm', user.auth, ksm.delete, endRequest)



// // Transaction route
// router.post('/transaction', user.auth, transaction.create, endRequest)
// router.post('/transaction/loan', user.auth, loan.read, transaction.createTransactionLoan, loanPayment.update, endRequest)
// router.get('/transaction', user.auth, transaction.read, endRequest)
// router.put('/transaction', user.auth, transaction.update, endRequest)
// router.delete('/transaction', user.auth, transaction.delete, endRequest)



// // COA route
// router.post('/coa', user.auth, coa.create, endRequest)
// router.get('/coa', user.auth, coa.read, endRequest)
// router.put('/coa', user.auth, coa.update, endRequest)
// router.delete('/coa', user.auth, coa.delete, endRequest)

// // Loan route
// router.post('/loan', user.auth, ksm.read, loan.read, loan.create, endRequest)
// router.post('/loans', user.auth, ksm.read, loan.read, loan.creates, loan.approves, loanPayment.creates, endRequest)
// router.get('/loan', user.auth, loan.read, endRequest)
// router.put('/loan', user.auth, loan.update, endRequest)
// router.put('/loan/approval', user.auth, loan.read, loan.approveLoan, loanPayment.create, endRequest)
// router.delete('/loan', user.auth, loan.delete, endRequest)

// Loan Payment route
// router.post('/loanPayment', user.auth, loan.read, loanPayment.read, 
//     transactionLoan.read, transactionLoan.check, transaction.create, 
//     transactionLoan.create, loanPayment.update, endRequest
// )
// router.post('/loanPayments', user.auth, transactionLoan.creates, endRequest)
// router.get('/loanpayment', user.auth, loanPayment.read, endRequest)

// // Report route
// router.get('/report/collectibility/download', report.collectibilityReport)

module.exports = router