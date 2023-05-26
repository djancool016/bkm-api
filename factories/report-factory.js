const {LoanPaymentFactory} = require('./loanPayment-factory')
const {LoanFactory} = require('./loan-factory')
const ExcelJs = require('exceljs')
const { DataLogger } = require('../utils')

class ReportFactory {
    constructor(){
        this.loanPayment = new LoanPaymentFactory
    }

    async collectibilityReport({id_loan}){

        // Validate loan payment
        let loanPayment = await this.loanPayment.read({id_loan})
        let {status, code, data} = loanPayment
        if(status == false) return loanPayment

        // convert data json to xls
        let workbook = new ExcelJs.Workbook()
        let worksheet = workbook.addWorksheet('Kolektibilitas')

        // set header
        let headers = Object.keys(data[0].dataValues)
        console.log(headers)
        worksheet.getRow(1).values = headers

        // populate data row
        for(let i = 0; i < data.length; i++){
            let dataRow = Object.values(data[i].dataValues)
            worksheet.addRow(dataRow)
        }
        workbook.xlsx.writeFile("output.xlsx")

        return new DataLogger({data: await workbook.xlsx.writeBuffer()}).log
    }
}

module.exports = {ReportFactory}