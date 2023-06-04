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
const { StatusLogger } = require('./utils')

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
router.post('/ksms', 
    (req, res, next) => validator(req, res, next, input.ksm.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.creates, endRequest
)
router.get('/ksm', 
    (req, res, next) => validator(req, res, next, input.ksm.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.read, endRequest
)
router.put('/ksm', 
    (req, res, next) => validator(req, res, next, input.ksm.update), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.update, endRequest
)
router.delete('/ksm', 
    (req, res, next) => validator(req, res, next, input.ksm.destroy), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),
    ksm.destroy, endRequest
)

// Coa route
router.post('/coa', 
    (req, res, next) => validator(req, res, next, input.coa.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.create, endRequest
)
router.get('/coa', 
    (req, res, next) => validator(req, res, next, input.coa.read), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.read, endRequest
)
router.put('/coa', 
    (req, res, next) => validator(req, res, next, input.coa.update), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.update, endRequest
)
router.delete('/coa', 
    (req, res, next) => validator(req, res, next, input.coa.destroy), user.auth,
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    coa.destroy, endRequest
)
 
// Loan route
router.post('/loan', 
    (req, res, next) => validator(req, res, next, input.loan.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    ksm.read, loan.read, loan.create, loan.approve, 
    (req, res, next) => {
        if(req.isApproved.status) return next()
        return endRequest(req, res) 
    }, 
    loanPayment.create, endRequest
)
router.post('/loans', 
    (req, res, next) => validator(req, res, next, input.loan.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
    loan.creates, endRequest
)
/router.get('/loan', 
    (req, res, next) => validator(req, res, next, input.loan.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
    loan.read, endRequest
)
router.put('/loan', 
    (req, res, next) => validator(req, res, next, input.loan.update), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
    ksm.read, loan.read, loan.update, endRequest
)
router.put('/loan/approval', 
    (req, res, next) => validator(req, res, next, input.loan.approve), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    loan.read, loan.approve, 
    (req, res, next) => {
        if(req.isApproved.status) return next()
        return endRequest(req, res) 
    }, 
    loanPayment.create, endRequest
)
router.delete('/loan', 
    (req, res, next) => validator(req, res, next, input.loan.destroy), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    loan.read, loan.destroy, endRequest
)


// Transaction route
router.post('/transaction', 
    (req, res, next) => validator(req, res, next, input.transaction.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    lkm.read, coa.read ,transaction.create, endRequest
)
router.post('/transactions', 
    (req, res, next) => validator(req, res, next, input.transaction.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.creates, endRequest
)
router.get('/transaction', 
    (req, res, next) => validator(req, res, next, input.transaction.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.read, endRequest
)
router.put('/transaction', 
    (req, res, next) => validator(req, res, next, input.transaction.update), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.update, endRequest
)
router.delete('/transaction', 
    (req, res, next) => validator(req, res, next, input.transaction.destroy), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    transaction.destroy, endRequest
)



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