const {middlewareRequest} = require('./base-controller')
const {ReportFactory} = require('../factories/report-factory')
const { StatusLogger } = require('../utils')
const factory = new ReportFactory

async function collectibilityReport(req, res, next){

    let result = await factory.collectibilityReport(req.body)
    let {status, code, data} = result
    if(status == false) return res.status(code).json(result)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
    res.send(data);
}

module.exports = {
    collectibilityReport
}