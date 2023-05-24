const {middlewareRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const factory = new LoanFactory

async function createLoan(req, res, next){

    let allowedKey = {
        integer: ['id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function readLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_loan', 'id_ksm'],
        string: ['ksm_name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{status, code, data} = req.result
    req.loan = data
    
    if(status) return next()
    res.status(code).json(req.result)
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

module.exports = {
    create: createLoan,
    read: readLoan,
    update: updateLoan,
    delete: deleteLoan,
    approveLoan
}