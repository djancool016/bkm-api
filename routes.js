const router = require('express').Router()
const transaction = require('./controllers/transaction-controller')
const ksm = require('./controllers/ksm-controller')
const lkm = require('./controllers/lkm-controller')

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

module.exports = router