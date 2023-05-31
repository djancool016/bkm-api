const {middlewareRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const { StatusLogger, DataLogger } = require('../utils')
const factory = new LoanFactory
const loanPayment = new LoanPaymentFactory()

async function createLoan(req, res, next, allowedKey = {}, keyValidation = false){

    let allowedRole = [1, 2]

    if(req.loan){
        for(let i = 0; i < req.loan.length; i++){
            if(req.loan[i].is_finish == false) {
                return res.status(400).json(new StatusLogger({code: 400, message:`Ksm ${req.loan[i].ksm.name} have unfinished Loan`}).log)
            }
        }
    }
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body), keyValidation)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function bulkCreateLoans(req, res, next){

    let allowedKey = {}
    let allowedRole = [1, 2]
    
    if(req.ksms.length != req.body.loans.length){
        return res.status(400).json(new StatusLogger({code: 400, message:'Some KSM not found'}).log)
    }

    req.body.ksmLoans = req.ksmLoans
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.bulkCreate(req.body))
    let{status, code, data} = req.result

    if(status){
        req.loans = data
        return next()
    }
    res.status(code).json(req.result)
}


async function readLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_loan', 'id_ksm'],
        array: ['loans', 'loanIds', 'ksmIds'],
        string: ['ksm_name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    let {loanIds, id_ksm, ksm_name, ksmIds} = req.body

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{code, data} = req.result
    if(code == 404) req.result.message = 'Loan not found'

    if(ksmIds || ksm_name || id_ksm) req.ksmLoans = data
    else if(loanIds) req.loans = data
    else req.loan = data
    
    return next()
}

async function updateLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function deleteLoan(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function approveLoan(req, res, next){

    let allowedKey = {
        date: ['start_date']
    }
    let allowedRole = [1, 2]

    req.body.loan = req.loan
    
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.loanApproval(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function bulkApproveLoans(req, res, next){

    let allowedKey = {}
    let allowedRole = [1, 2]

    req.loans.map(loan => {
        loan.start_date = req.body.loans.find(l=> l.id_ksm == loan.id_ksm).start_date
    })

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.bulkLoanApproval({loans: req.loans}))
    let{status, code, data} = req.result
    
    if(status){
        req.approvedIds = data
        return next()
    }
    res.status(code).json(req.result)
}

module.exports = {
    create: createLoan,
    creates: bulkCreateLoans,
    read: readLoan,
    update: updateLoan,
    delete: deleteLoan,
    approveLoan,
    bulkApproveLoans
}