const {middlewareRequest} = require('./base-controller')
const {ReportFactory} = require('../factories/report-factory')
const factory = new ReportFactory


async function paymentReport(req, res, next){
    
    let model = factory.paymentReport(req.body)
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.paymentReport = result
    return next()
    
}

async function cashReport(req, res, next){
    
    let model = factory.cashReport(req.body)
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    req.result = result
    req.cashReport = result
    return next()
    
}

async function reportXls(req, res, next){

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=download.xlsx')
    res.setHeader('Content-Transfer-Encoding', 'binary')

    let model = factory.reportXls({
        requestBody: req.body,
        paymentReport: req.paymentReport
    })
    let result = await middlewareRequest(req, res, model)
    if (result.status == false) return res.status(result.code).json(result)

    return res.send(result.data)
}

module.exports = {
    paymentReport, reportXls, cashReport
}