const {middlewareRequest} = require('./base-controller')
const {LoanFactory} = require('../factories/loan-factory')
const {LoanPaymentFactory} = require('../factories/loanPayment-factory')
const { StatusLogger, DataLogger } = require('../utils')
const factory = new LoanFactory
const loanPayment = new LoanPaymentFactory()

async function createLoan(req, res, next){

    let allowedKey = {
        integer: ['id_ksm', 'total_loan', 'loan_duration', 'loan_interest']
    }
    let allowedRole = [1, 2]

    if(req.loan){
        for(let i = 0; i < req.loan.length; i++){
            if(req.loan[i].is_finish == false) {
                return res.status(400).json(new StatusLogger({code: 400, message:`Ksm ${req.loan[i].ksm.name} have unfinished Loan`}).log)
            }
        }
    }

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.create(req.body))
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function bulkCreateLoans(req, res, next){

    let allowedKey = {
        array: ['loans']
    }
    let allowedRole = [1, 2]

    if(req.loan){
        for(let i = 0; i < req.loan.length; i++){
            if(req.loan[i].is_finish == false) {
                return res.status(400).json(new StatusLogger({code: 400, message:'Some Ksm have unfinished Loan'}).log)
            }
        }
    }
    
    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.bulkCreate(req.body))
    let{status, code, data} = req.result

    req.loans = data
    
    if(status) return next()
    res.status(code).json(req.result)
}


async function readLoan(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_loan'],
        array: ['loanIds', 'loans', 'id_ksm'],
        string: ['ksm_name'],
        boolean: ['findLatest']
    }
    let allowedRole = [1, 2]

    if(req.body.loans){
        req.body.id_ksm = req.body.loans.map(loan => loan.id_ksm)
    }
    if(isNaN(req.body.id_ksm) == false){
        req.body.id_ksm = [req.body.id_ksm]
    }

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    let{data} = req.result
    req.loan = data
    
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

    let allowedRole = [1, 2]
    let unapproved = {
        loan: [],
        payment: []
    }
    let approval
    let payment

    if(req.loans.length > 0){

        for(let i = 0; i < req.loans.length; i++){

            req.body.loan = req.loans[i]
            let id = req.body.loan.id
            let{start_date} = req.body.loans.find(result => result.id_ksm === req.body.loan.id_ksm)
            req.body.start_date = start_date
        
            approval = await middlewareRequest(req, res, allowedKey = {}, allowedRole, factory.loanApproval(req.body))
            payment = await middlewareRequest(req, res, allowedKey = {}, allowedRole, loanPayment.create({id_loan: id}))

            if(approval.status == false) unapproved.loan.push(id)
            if(payment.statys == false) unapproved.payment.push(id)
        }
        if(unapproved.loan.length > 0 || unapproved.payment.length > 0) {
            res.status(400).json(new DataLogger({data: unapproved, code: 400, message:`loan approval failed`}))
        }
        if(approval.status) return next()
        return res.status(approval.code).json(approval)   
    }
    return res.status(400).json(new StatusLogger({code: 400, message:"Bulk Approval Failed"}))  
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