const router = require('express').Router()
const transaction = require('./controllers/transaction-controller')
const ksm = require('./controllers/ksm-controller')
const lkm = require('./controllers/lkm-controller')
const coa = require('./controllers/coa-controller')
const loan = require('./controllers/loan-controller')
const loanPayment = require('./controllers/loanPayment-controller')

// Transaction route
router.post('/transaction', transaction.create)
router.get('/transaction', transaction.read)
router.put('/transaction', transaction.update)
router.delete('/transaction', transaction.delete)

// KSM route
router.post('/ksm', ksm.create)
router.get('/ksm', ksm.read)
router.put('/ksm', ksm.update)
router.delete('/ksm', ksm.delete)

// LKM route
router.post('/lkm', lkm.create)
router.get('/lkm', lkm.read)
router.put('/lkm', lkm.update)
router.delete('/lkm', lkm.delete)

// COA route
router.post('/coa', coa.create)
router.get('/coa', coa.read)
router.put('/coa', coa.update)
router.delete('/coa', coa.delete)

// Loan route
router.post('/loan', loan.create)
router.get('/loan', loan.read)
router.put('/loan', loan.update)
router.put('/loan/approval', loan.approveLoan, loanPayment.create)
router.delete('/loan', loan.delete)

// Loan route
router.get('/loanpayment', loanPayment.read)

module.exports = router