const express = require('express')
const transaction = require('./controllers/transaction-controller')

const router = express.Router()

// Transaction route
router.post('/transaction', transaction.create)
router.get('/transaction', transaction.read)
router.put('/transaction', transaction.update)
router.delete('/transaction', transaction.delete)

module.exports = router