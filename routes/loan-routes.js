const router = require('express').Router()
const user = require('../controllers/user-controller')
const ksm = require('../controllers/ksm-controller')
const lkm = require('../controllers/lkm-controller')
const loan = require('../controllers/loan-controller')
const loanPayment = require('../controllers/loanPayment-controller')
const transaction = require('../controllers/transaction-controller')
const transactionLoan = require('../controllers/transactionLoan-controller')
const typeTransaction = require('../controllers/typeTransaction-controller')
const {input} = require('../routes-allowedKey')
const {validator, authorize, endRequest} = require('../controllers/base-controller')

// Loan route
router.post('/', 
    (req, res, next) => validator(req, res, next, input.loan.create), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
    ksm.read, loan.read, loan.create, loan.approve, 
    (req, res, next) => {
        if(req.isApproved.status) {
            let id_type = (a, b) => {
                if(req.body.isFirstLedger == true) return a
                return b
            }
            req.body.id_type = id_type(38, 3)
            req.body = {
                id_lkm: 1,
                id_type: req.body.id_type,
                total: req.body.total_loan,
                trans_date: req.body.loan_start
            }
            return next()
        }
        return endRequest(req, res) 
    }, 
    lkm.read, typeTransaction.read, transaction.create, transactionLoan.create, endRequest
)
router.post('/bulk', 
    (req, res, next) => validator(req, res, next, input.loan.creates), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
    loan.creates, endRequest
)
router.get('/', 
    (req, res, next) => validator(req, res, next, input.loan.read), user.auth, 
    (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
    loan.read, endRequest
)
// router.put('/', 
//     (req, res, next) => validator(req, res, next, input.loan.update), user.auth, 
//     (req, res, next) => authorize(req, res, next, allowedRole = [1]),  
//     ksm.read, loan.read, loan.update, endRequest
// )
// router.put('/approval', 
//     (req, res, next) => validator(req, res, next, input.loan.approve), user.auth, 
//     (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
//     loan.read, loan.approve, 
//     (req, res, next) => {
//         if(req.isApproved.status) return next()
//         return endRequest(req, res) 
//     }, 
//     endRequest
// )
// router.delete('/', 
//     (req, res, next) => validator(req, res, next, input.loan.destroy), user.auth, 
//     (req, res, next) => authorize(req, res, next, allowedRole = [1]), 
//     loan.read, loan.destroy, endRequest
// )

module.exports = router