const {LoanPaymentFactory} = require('./loanPayment-factory')
const {TransactionLoanFactory} = require('./transactionLoan-factory')
const {LoanFactory} = require('./loan-factory')
const ExcelJs = require('exceljs')
const { DataLogger, DateFormat, StatusLogger } = require('../utils')

class ReportFactory {
    constructor(){
        this.loan = new LoanFactory
        this.loanPayment = new LoanPaymentFactory
        this.transactionLoan = new TransactionLoanFactory
    }
    
    async paymentReport({id_lkm = 1, year, month}){

        month = String(month).padStart(2, '0')

        let start_date = new DateFormat(`${year}-${month}`)
        if(start_date.toISOString() == 'Invalid date') return new StatusLogger({code:400, message:'Invalid date format'}).log

        let end_date = new DateFormat(`${year}-${month}`)
        end_date.addMonths = 1
        end_date.addDays = -1
        end_date = end_date.toISOString(false)

        let lastMonth = new DateFormat(`${year}-${month}`)
        lastMonth.addDays = -1
        lastMonth = lastMonth.toISOString(false)

        let paymentReport = []

        // Find loan data
        let loan = await this.loan.read({id_lkm, is_finish: false})
        if(loan.status == false) return loan
        
        loan.data.forEach(obj => {
            const {
                id: id_loan, id_ksm, loan_duration, loan_start, loan_end, total_loan, 
                loan_interest, total_interest, ksm:{name}
            } = obj

            let total_bop = total_loan * 0.05 / 100 * loan_duration

            paymentReport.push({
                id_loan, id_ksm, ksm_name: name, loan_duration, 
                loan_interest, loan_start, loan_end, trans_date: null,
                total_loan, total_interest, total_bop,
                paid_loan: 0, paid_interest: 0, paid_bop: 0,
                pay_loan: 0, pay_interest: 0, pay_bop: 0
            })
        })
        
        let loanIds = paymentReport.map(loan => loan.id_loan)

        // Find transaction loan data
        let transactionLoan = await this.transactionLoan.read({id_loan: loanIds, end_date})
        if(transactionLoan.status == false) return transactionLoan

        transactionLoan.data.forEach(obj => {

            let {id_coa, trans_date, total} = obj.transaction
            let {id: id_loan} = obj.loan

            const index = paymentReport.findIndex(item => {
                return item.id_loan == id_loan
            })
            paymentReport[index].trans_date = trans_date

            let isLastMonth = new DateFormat(trans_date).diffDays(lastMonth) >= 0

            if(isLastMonth){
                switch(id_coa){
                    case 16:
                        paymentReport[index].paid_loan += total
                        break
                    case 17:
                        paymentReport[index].paid_interest += total
                        break
                    case 18:
                        paymentReport[index].paid_bop += total
                        break
                    default:
                        break
                }
            }else{
                switch(id_coa){
                    case 16:
                        paymentReport[index].pay_loan += total
                        break
                    case 17:
                        paymentReport[index].pay_interest += total
                        break
                    case 18:
                        paymentReport[index].pay_bop += total
                        break
                    default:
                        break
                }
            }
            let {
                total_loan, total_interest, total_bop,
                paid_loan, paid_interest, paid_bop,
                pay_loan, pay_interest, pay_bop
            } = paymentReport[index]

            paymentReport[index].remaining_loan = total_loan - (paid_loan + pay_loan)
            paymentReport[index].remaining_interest = total_interest - (paid_interest + pay_interest)
            paymentReport[index].remaining_bop = total_bop - (paid_bop + pay_bop)
        })

        for(let i = 0; i < paymentReport.length; i++){

            let loanPayment = await this.loanPayment.read({id_loan : paymentReport[i].id_loan})
            if(loanPayment.status == false) return loanPayment
            
            let {trans_date} = paymentReport[i]
            let dateParts = trans_date.split("-")
            let newtransDate = `${dateParts[0]}-${dateParts[1].padStart(2,'0')}`

            // use this if ignore date, set all date to 1
            trans_date = new DateFormat(newtransDate)

            let collectibillity = {
                current: 0,
                deliquent: 0,
                doubtful: 0,
                nonperforming: 0,
                default: 0
            }

            loanPayment.data.forEach(obj => {
                
                let {
                    payment_no, due_date, 
                    loan_full: monthly_loan, loan_remaining, interest_full: monthly_interest, 
                    interest_remaining, is_settled
                } = obj

                let parts = due_date.split('-')
                let newDueDate = `${parts[0]}-${parts[1].padStart(2,'0')}-01`

                // chack if transaction is in due_date month
                let isThisMonth = trans_date.diffDays(newDueDate)

                // default
                if(isThisMonth < -270){
                    collectibillity.default += loan_remaining
                }
                // non-performing
                else if(isThisMonth < -180){
                    collectibillity.nonperforming += loan_remaining
                }
                // doubtful
                else if(isThisMonth < -90){
                    collectibillity.doubtful += loan_remaining
                }
                // deliquent
                else if(isThisMonth <= 0){
                    collectibillity.deliquent += loan_remaining
                }
                // current
                else {
                    collectibillity.current += loan_remaining
                }
                
                // chack if transaction is in 30 days from due_date
                if(isThisMonth <= 0 && isThisMonth >= -30) {
                    paymentReport[i] = {
                        ...paymentReport[i], 
                        ['this_month_payment']: {
                            payment_no, due_date, loan_remaining, interest_remaining, monthly_loan, monthly_interest,is_settled
                        },
                        ['collectibillity']: collectibillity
                    }
                }
            })
        }

        return new DataLogger({data: paymentReport}).log
    }

    async paymentReportXls(paymentReport){

        if(paymentReport.status == false) return paymentReport

        const workbook = new ExcelJs.Workbook()
        const worksheet = workbook.addWorksheet('Angsuran')

        // Set header and footer
        worksheet.headerFooter.oddHeader = 'Header Text'
        worksheet.headerFooter.oddFooter = 'Footer Text'

        let insertedRow = 0
        let types = []

        // START TABLE HEAD
        let row = worksheet.getRow(2 + insertedRow)
        let head = [
            'No','KSM', 'Tanggal Pencairan', 
            'Jumlah Pinjaman','Tanggal Angsuran','Angs ke',
            'Pokok', 'Bunga', 'BOP', 'Jumlah',
            'Pokok', 'Bunga', 'BOP', 'Jumlah'
        ]
        fillHeadTable(row, head)

        mergeRows(worksheet, ['A','B','C','D','E','F'], 1, 2, insertedRow)
        mergeColumn(worksheet, "Angsuran Bulan Ini",'G', 'J', 1, insertedRow)
        mergeColumn(worksheet, "Sisa Angsuran Bulan Ini",'K', 'N', 1, insertedRow)

        // START TABLE CONTENT
        paymentReport.data.forEach((item, index) => {

            let row = worksheet.getRow(index + 3 + insertedRow)
            let content = [
                {data: index + 1, type: 'number'},
                {data: item.ksm_name, type: 'string'},
                {data: item.loan_start, type: 'date'},
                {data: item.total_loan, type: 'currency'},       
                {data: item.trans_date, type: 'date'},  
                {data: item.this_month_payment.payment_no, type: 'number'}, 
                {data: item.pay_loan, type: 'currency'}, 
                {data: item.pay_interest, type: 'currency'}, 
                {data: item.pay_bop, type: 'currency'}, 
                {data: item.pay_loan + item.pay_interest + item.pay_bop, type: 'currency'},
                {data: item.remaining_loan, type: 'currency'}, 
                {data: item.remaining_interest, type: 'currency'}, 
                {data: item.remaining_bop, type: 'currency'}, 
                {data: item.remaining_loan + item.remaining_interest + item.remaining_bop, type: 'currency'}, 
            ]
            types = fillContents(row, content)
        })

        columnWidth(worksheet, types)
        let buffer = await workbook.xlsx.writeBuffer()
        return new DataLogger({data: buffer}).log
    }
}

// full head table
function fillHeadTable(row, obj){

    let cellNum = 1

    obj.forEach(data => {
        let cell = row.getCell(cellNum)
        cell.value = data
        cell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}
        cellNum ++
        return cell
    })
}

// fill content cell
function fillContents(row, obj){

    let cellNum = 1
    let types = []

    obj.forEach(({data, type}) => { 

        let cell = row.getCell(cellNum)
        cell.value = data
        types.push(type)

        switch(type){
            case 'number':
                cell.alignment = {horizontal: 'center'}
                break
            case 'date':
                cell.alignment = {horizontal: 'center'}
                break
            case 'currency':
                cell.numFmt = '#,##0'
                break
            default:
                break
        } 
        cellNum ++
        return cell
    })
    return types
}

// column witdh by array
function columnWidth(worksheet, type){
    let i = 0
    worksheet.columns.forEach(column => {
        switch(type[i]){
            case 'number':
                column.width = 5
                break
            case 'date':
                column.width = 12
                break
            case 'currency':
                column.width = 13
                break
            case 'string':
                column.width = 20
                break
            default:
                break
        }       
        i++
    })
}

// merge rows on every columns sequentialy, ex A1:A2, B1,B2, ... ect
function mergeRows(worksheet, columns, rowStart, rowEnd, insertedRow){
    columns.forEach(char => {
        let cell = worksheet.getCell(`${char}${rowStart + insertedRow}`)
        if(!cell.value) {
            cell.value = worksheet.getCell(`${char}${rowEnd + insertedRow}`).value
            cell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}  
        }
        return worksheet.mergeCells(`${char}${rowStart + insertedRow}:${char}${rowEnd + insertedRow}`)
    })
}

// merge columns
function mergeColumn(worksheet, value, columnStart, columnEnd, row, insertedRow){
    let cell = worksheet.getCell(`${columnStart}${row + insertedRow}`)
    cell.value = value
    cell.alignment = {horizontal: 'center', vertical: 'middle', wrapText: true} 
    return worksheet.mergeCells(`${columnStart}${row + insertedRow}:${columnEnd}${row + insertedRow}`)
}

module.exports = {ReportFactory}