const {middlewareRequest} = require('./base-controller')
const {ReportFactory} = require('../factories/report-factory')
const factory = new ReportFactory


async function loanReports(req, res, next){

    let model = factory.loanReports({
        loans: req.loan,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.loanReports = result
    return next()
    
}

async function cashReports(req, res, next){

    let model = factory.cashReports({
        ledger: req.ledger
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.cashReports = result
    return next()
    
}

async function reportXls(req, res, next){

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=download.xlsx')
    res.setHeader('Content-Transfer-Encoding', 'binary')

    let model = factory.generateXls({
        loanReports: req.loanReports,
        bbns: req.bbns,
        ledger: req.ledger,
        requestBody: req.body
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    return res.send(result.data)
}

module.exports = {
    loanReports, reportXls, cashReports
}