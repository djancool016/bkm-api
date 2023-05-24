const {middlewareRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const factory = new LoanFactory

function createLoan(req, res, next){

    let allowedKey = {
        integer: ['id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    next()
}
function readLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm'],
        string: ['ksm_name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    next()
}
function updateLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.update(req.body))
    next()
}
function deleteLoan(req, res, next){
    let allowedKey = {
        integer: ['id']
    }
    let allowedRole = [1, 2]

    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.delete(req.body))
    next()
}
function approveLoan(req, res, next){

    let allowedKey = {
        integer: ['id'],
        date: ['start_date']
    }
    let allowedRole = [1, 2]
    
    req.result = middlewareRequest(req, res, allowedKey, allowedRole, factory.loanApproval(req.body))
    next()
}

module.exports = {
    create: createLoan,
    read: readLoan,
    update: updateLoan,
    delete: deleteLoan,
    approveLoan
}