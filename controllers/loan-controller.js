const {baseRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const factory = new LoanFactory

function createLoan(req, res){

    let allowedKey = {
        integer: ['id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    return baseRequest(req, res, allowedKey, factory.create(req.body))
}
function readLoan(req, res){

    let allowedKey = {
        integer: ['id', 'id_ksm'],
        string: ['ksm_name'],
        boolean: ['findLatest']
    }
    return baseRequest(req, res, allowedKey, factory.read(req.body))
}
function updateLoan(req, res){

    let allowedKey = {
        integer: ['id', 'id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    return baseRequest(req, res, allowedKey, factory.update(req.body))
}
function deleteLoan(req, res){
    let allowedKey = {
        integer: ['id']
    }
    return baseRequest(req, res, allowedKey, factory.delete(req.body))
}
function approveLoan(req, res){

    let allowedKey = {
        integer: ['id'],
        date: ['start_date']
    }
    return baseRequest(req, res, allowedKey, factory.loanApproval(req.body))
}

module.exports = {
    create: createLoan,
    read: readLoan,
    update: updateLoan,
    delete: deleteLoan,
    approveLoan
}