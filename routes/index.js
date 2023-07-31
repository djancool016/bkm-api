const router = require('express').Router()

router.use('/lkm', require('./lkm-routes'))
router.use('/ksm', require('./ksm-routes'))
router.use('/coa', require('./coa-routes'))
router.use('/account', require('./account-routes'))
router.use('/loan', require('./loan-routes'))
router.use('/transaction', require('./transaction-routes'))
router.use('/transactionLoan', require('./transactionLoan-routes'))
router.use('/loanPayment', require('./loanPayment-routes'))
router.use('/ledger', require('./ledger.routes'))
router.use('/report', require('./report-routes'))

module.exports = router