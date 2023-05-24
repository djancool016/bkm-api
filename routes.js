const router = require('express').Router()
const {endRequest} = require('./controllers/base-controller')
const user = require('./controllers/user-controller')
const transaction = require('./controllers/transaction-controller')
const ksm = require('./controllers/ksm-controller')
const lkm = require('./controllers/lkm-controller')
const coa = require('./controllers/coa-controller')
const loan = require('./controllers/loan-controller')
const loanPayment = require('./controllers/loanPayment-controller')

// Transaction route
router.post('/transaction', user.auth, transaction.create, endRequest)
router.post('/transaction/loan', user.auth, transaction.isLoan, loan.read, transaction.create, loanPayment.update, endRequest)
router.get('/transaction', user.auth, transaction.read, endRequest)
router.put('/transaction', user.auth, transaction.update, endRequest)
router.delete('/transaction', user.auth, transaction.delete, endRequest)

// KSM route
router.post('/ksm', user.auth, ksm.create, endRequest)
router.get('/ksm', user.auth, ksm.read, endRequest)
router.put('/ksm', user.auth, ksm.update, endRequest)
router.delete('/ksm', user.auth, ksm.delete, endRequest)

// LKM route
router.post('/lkm', user.auth, lkm.create, endRequest)
router.get('/lkm', user.auth, lkm.read, endRequest)
router.put('/lkm', user.auth, lkm.update, endRequest)
router.delete('/lkm', user.auth, lkm.delete, endRequest)

// COA route
router.post('/coa', user.auth, coa.create, endRequest)
router.get('/coa', user.auth, coa.read, endRequest)
router.put('/coa', user.auth, coa.update, endRequest)
router.delete('/coa', user.auth, coa.delete, endRequest)

// Loan route
router.post('/loan', user.auth, loan.create, endRequest)
router.get('/loan', user.auth, loan.read, endRequest)
router.put('/loan', user.auth, loan.update, endRequest)
router.put('/loan/approval', user.auth, loan.approveLoan, loanPayment.create, endRequest)
router.delete('/loan', user.auth, loan.delete, endRequest)

// Loan Payment route
router.get('/loanpayment', user.auth, loanPayment.read, endRequest)

module.exports = router