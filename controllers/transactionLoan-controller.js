const {middlewareRequest} = require('./base-controller')
const {TransactionLoanFactory} = require('../factories/transactionLoan-factory')
const { StatusLogger, DataLogger } = require('../utils')
const axios = require('axios')
const factory = new TransactionLoanFactory

async function create (req, res, next){

    let allowedKey = {}
    let allowedRole = [1, 2]
    let model = factory.create({
        loan: req.loan,
        transaction: req.transaction
    })

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code, data} = req.result
    req.transactionLoan = data
    
    if(status) return next()
    res.status(code).json(req.result)
}

async function creates (req, res, next){
    
    try {
        
        let okResponse = []
        let badResponse = []
        let url = 'http://localhost:5100/loanPayment'
        let {transactionLoans} = req.body

        //make bulk request
        let requests = transactionLoans.map( data => axios.post(url, data))

        const responses = await Promise.allSettled(requests)

        responses.forEach( response => {
            if (response.status === 'fulfilled') okResponse.push(response.value.data.data)
            else badResponse.push(response.reason.response.data)
        })

        if(badResponse.length > 0) return res.status(400).json(new DataLogger({
            data: badResponse,
            code: 400,
            message: 'Some requests failed to process'
        }).log) 

        if(okResponse.length > 0) {
            req.result = new DataLogger({
                data: badResponse,
                code: 400,
                message: 'Some requests failed to process'
            }).log 

            return next()
        }
        return res.status(400).json(new StatusLogger({
            code: 400,
            message: 'All loan payments failed to process'
        }))  

    } catch (error) {
        console.error('An error occurred:', error.message);
        res.status(500).json(error.message) 
    }
}

async function read(req, res, next){

    let allowedKey = {
        integer: ['id', 'id_transaction', 'id_loan','id_ksm']
    }
    let allowedRole = [1, 2]

    let result = await middlewareRequest(req, res, allowedKey, allowedRole, factory.read(req.body))
    if (result.code == 404) result.message = 'TransactionLoan not found'

    req.result = result
    req.transactionLoan = result

    return next()
}

async function check(req, res, next){
    let allowedKey = {
        integer:['id_loan', 'id_coa', 'total'],
        data:['trans_date']
    }
    let allowedRole = [1, 2]
    let model = factory.checkPayments({
        loan: req.loan,
        transaction: req.body,
        transactionLoan: req.transactionLoan,
        loanPayment: req.loanPayment
    })

    req.result = await middlewareRequest(req, res, allowedKey, allowedRole, model)
    let{status, code} = req.result
    
    if(status) return next()
    res.status(code).json(req.result)
}

module.exports = {create, creates, read, check}
