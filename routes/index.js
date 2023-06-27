const router = require('express').Router()

router.use('/lkm', require('./lkm-routes'))
router.use('/ksm', require('./ksm-routes'))
router.use('/coa', require('./coa-routes'))
router.use('/loan', require('./loan-routes'))
router.use('/transaction', require('./transaction-routes'))
router.use('/transactionLoan', require('./transactionLoan-routes'))
router.use('/loanPayment', require('./loanPayment-routes'))

module.exports = router