const {LoanPaymentFactory} = require('./loanPayment-factory')
const {TransactionLoanFactory} = require('./transactionLoan-factory')
const {CoaFactory} = require('./coa-factory')
const ExcelJs = require('exceljs')
const { DataLogger, DateFormat, StatusLogger } = require('../utils')

class PaymentReport {
    constructor({ loans, requestBody }){

        this.loans = loans.data
        this.requestBody = requestBody
        this.loanPayment = new LoanPaymentFactory
        this.transactionLoan = new TransactionLoanFactory
    }
    async #loanPayments(){

        const loanPayments = []

        if(this.loans){

            for(let i = 0; i < this.loans.length; i++){
                const loanLogger = new DataLogger({data: this.loans[i]}).log
                const transactionLoan = await this.transactionLoan.read({id_loan: this.loans[i].id})
                const loanPayment = await this.loanPayment.read({loan: loanLogger, transactionLoan, requestBody: this.requestBody})
                if(loanPayment.status) loanPayments.push(loanPayment.data)
            }
        }
        return loanPayments
    }
    get generate(){
        return this.#loanPayments()
    }
}
class ReportXls {
    constructor(){
        this.workbook = new ExcelJs.Workbook()
        this.insertedRow = 0
    }
    addWorksheet({name, paperSize = 5, orientation = 'landscape'}){
        this.insertedRow = 1
        this.worksheet = this.workbook.addWorksheet(name, {
            pageSetup: {paperSize, orientation, fitToPage: true}
        })
    }
    addHeader({date = new Date, title = '', columnStart = 'A', columnEnd = 'O'}){
        let headerText = [
            `${title.toUpperCase()}`,
            "BADAN KESWADAYAAN MASYARAKAT (BKM) SEJAHTERA",
            "KELURAHAN UNGARAN KECAMATAN UNGARAN BARAT",
            "Alamat: Jalan. MT. Haryono No.26  Tlp (024) 76911081 Ungaran 50511"
        ]
        this.insertedRow = fillHeader(this.worksheet, headerText, columnStart, columnEnd, this.insertedRow)

        date = new DateFormat(date)
        date = `${date.toLocaleString(false)}`
        mergeColumn(this.worksheet, date, columnStart, columnEnd, 0, this.insertedRow, 'right', {bold: true})

        this.insertedRow ++
    }
    addTable({name, head = [], content = []}){
        this.worksheet.addTable({
            name,
            ref: `A${this.insertedRow}`,
            headerRow: true,
            headerRowCount: 2,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: head,
            rows: content
        })
    }
    formatCells({contentType = [], content = []}){

        columnWidth(this.worksheet, contentType)
        formatContent(this.worksheet, contentType, content.length + 1, this.insertedRow)
        this.worksheet.getRow(this.insertedRow).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}
    }
    mergeColumn({name, contentLength = 0, align = 'left', columnStart = 'A', columnEnd = 'B'}){
        mergeColumn(this.worksheet, name, columnStart, columnEnd, contentLength, this.insertedRow, align)
    }
    addAfterTable({contentLength = 0, columnNum, data}){
        fillContents(this.worksheet, contentLength, columnNum, data, this.insertedRow)
    }
    addInsertedRow(totalInserted){
        this.insertedRow += totalInserted
    }
    get generate(){
        return this.workbook
    }
}

class ReportFactory {
    constructor(){
        this.workbook = new ReportXls
        this.coa = new CoaFactory
        this.totalCollectibility = 0
    }
    async loanReports({loans, requestBody}){

        const report = new PaymentReport({loans, requestBody})
        const data = await report.generate
        return new DataLogger({data}).log
    }
    async #paymentWorksheet({loanReports, requestBody}){

        if(!loanReports || loanReports.status == false) {
            return loanReports || new StatusLogger({code: 404, message: 'Loan Reports not found'}).log
        }

        const {head, content, contentType} = paymentWorksheetContent(loanReports, requestBody)
        
        this.workbook.addWorksheet({name: 'Angsuran'})
        this.workbook.addHeader({
            date: requestBody.end_date,
            title: 'DAFTAR RINCIAN ANGSURAN PINJAMAN KSM'
        })

        this.workbook.addTable({name: 'Angsuran', head, content})
        this.workbook.formatCells({contentType, content})
    }
    async #collectibilityWorksheet({loanReports, requestBody}){

        if(!loanReports || loanReports.status == false) {
            return loanReports || new StatusLogger({code: 404, message: 'Loan Reports not found'}).log
        }
        const {head, content, contentType} = collectibilityWorksheetContent(loanReports, requestBody)
        
        const header = {
            date: requestBody.end_date,
            title: 'DAFTAR KOLEKTIBILITAS PINJAMAN KSM'
        }
        const ratio_percent_title = {
            name: 'RR / NPL',
            contentLength: content.length + 2
        }
        const ratio_percent_value = {
            contentLength: content.length + 2,
            columnNum: 11,
            data: [
                {data: 0.5, type: 'percent'},
                {data: 0.5, type: 'percent'},
                {data: 10, type: 'percent'},
                {data: 50, type: 'percent'},
                {data: 100, type: 'percent'}
            ]
        }
        const ratio_currency_title = {
            name: 'Resiko Kredit',
            contentLength: content.length + 3
        }
        const calculateRisk = (percent, content, colNum) => {
            const sum = content.reduce((sum, arr) => {
                return sum + arr[colNum]
            }, 0)
            return sum * percent / 100
        }

        const ratio_currency_value = {
            contentLength: content.length + 3,
            columnNum: 11,
            data: [
                {data: calculateRisk(0.5, content, 10), type: 'currency'},
                {data: calculateRisk(0.5, content, 11), type: 'currency'},
                {data: calculateRisk(10, content, 12), type: 'currency'},
                {data: calculateRisk(50, content, 13), type: 'currency'},
                {data: calculateRisk(100, content, 14), type: 'currency'}
            ]
        }

        this.totalCollectibility = ratio_currency_value.data.reduce((acc, value) => acc + value.data, 0)

        this.workbook.addWorksheet({name: 'Kolektibilitas'})
        this.workbook.addHeader(header)
        this.workbook.addTable({name: 'Kolektibilitas', head, content})
        this.workbook.formatCells({contentType, content})

        this.workbook.mergeColumn(ratio_percent_title)
        this.workbook.addAfterTable(ratio_percent_value)
        this.workbook.mergeColumn(ratio_currency_title)
        this.workbook.addAfterTable(ratio_currency_value)

    }
    async #bbnsWorksheet({bbns, requestBody}){

        if(!bbns || bbns.status == false) {
            return bbns || new StatusLogger({code: 404, message: 'BBNS not found'}).log
        }
        const coa = await this.coa.read({})
        if(coa.status == false) return coa

        const {head, content, contentType} = bbnsWorksheetContent(bbns.data, coa.data)
        const {
            head: pasiva_head, 
            content: pasiva_content, 
            contentType: pasiva_contentType
        } = bbnsWorksheetContent(bbns.data, coa.data, 'Pasiva')

        const header = {
            date: requestBody.end_date,
            title: 'DAFTAR KOLEKTIBILITAS PINJAMAN KSM',
            columnEnd: 'G'
        }

        this.workbook.addWorksheet({name: 'BBNS', orientation: 'potrait'})
        this.workbook.addHeader(header)
        this.workbook.addTable({name: 'Aktiva', head, content})
        this.workbook.formatCells({contentType, content})
        this.workbook.addInsertedRow(content.length + 2)
        this.workbook.addTable({name: 'Pasiva', head: pasiva_head, content: pasiva_content})
        this.workbook.formatCells({contentType:pasiva_contentType, content:pasiva_content})
        
    }
    async generateXls({loanReports, bbns, requestBody}){

        await this.#paymentWorksheet({loanReports, requestBody})
        await this.#collectibilityWorksheet({loanReports, requestBody})
        await this.#bbnsWorksheet({bbns, requestBody})

        const workbook = this.workbook.generate
        const buffer = await workbook.xlsx.writeBuffer()
        this.workbook = new ReportXls
        return new DataLogger({data: buffer}).log
    }
}


// table content for paymentReport
function paymentWorksheetContent(loanReports, requestBody){
    const head = [
        {name: 'No', type: 'number'},
        {name: 'KSM', type: 'string'},
        {name: 'Tanggal Pencairan', filterButton: true, type: 'date'},
        {name: 'Jumlah Pinjaman', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Tanggal Angsuran', filterButton: true, type: 'date'},
        {name: 'Angs ke', type: 'number'},
        {name: 'Angsuran Pokok', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Angsuran Bunga 1.45%', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Angsuran BOP 0.05%', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Jumlah Angsuran', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Sisa Pokok', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Sisa Bunga', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Sisa BOP', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Jumlah Sisa', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Keterangan', type: 'string'}
    ]
    const contentType = head.map(obj => obj.type)
    const content = []

    let payment_no = 0

    loanReports.data.forEach((loanReport, index) => {
        payment_no = 1
        const {
            loan, transactions, loanPayment, 
            paymentRemaining, paymentPaid, collectibility
        } = loanReport

        loanPayment.forEach(payment => {
            if(payment.monthly_loan_remaining < payment.monthly_loan){
                payment_no = payment.payment_no
            }
        })

        let pay_loan = 0
        let pay_interest = 0
        let pay_bop = 0
        let trans_date = null
        let collect = ''

        if(collectibility.current > 0) collect = 'Lancar'
        else if(collectibility.deliquent > 0) collect = 'Perlu Perhatian'
        else if(collectibility.doubtful > 0) collect = 'Kurang Lancar'
        else if(collectibility.nonperforming > 0) collect = 'Diragukan'
        else collect = 'Macet'

        const isThisMonth = (date_a, date_b) => {
            const month_a = new Date(date_a).getMonth()
            const month_b = new Date(date_b).getMonth()
            return month_a - month_b === 0
        }

        transactions.forEach(transaction => {

            switch(transaction.id_type){
                case 4,39: // Loan Payment
                    if(isThisMonth(transaction.trans_date, requestBody.end_date)){
                        pay_loan += transaction.total
                        trans_date = transaction.trans_date
                    }
                    break
                case 5,40: // Interest Payment
                    if(isThisMonth(transaction.trans_date, requestBody.end_date)){
                        pay_interest += transaction.total
                        trans_date = transaction.trans_date
                    }
                    break
                case 6,41: // BOP Payment
                    if(isThisMonth(transaction.trans_date, requestBody.end_date)){
                        pay_bop += transaction.total
                        trans_date = transaction.trans_date
                    }
                    break
                default:
                    break
            }
        })

        const {remaining_loan, remaining_interest, remaining_bop} = paymentRemaining

        content.push([
            index + 1,
            loan.ksm.name,
            loan.loan_start,
            loan.total_loan,
            trans_date,
            payment_no,
            pay_loan,
            pay_interest,
            pay_bop,
            pay_loan + pay_interest + pay_bop,
            remaining_loan,
            remaining_interest,
            remaining_bop,
            remaining_loan + remaining_interest + remaining_bop,
            collect
        ])
    })

    return {head, content, contentType}
}
// table content for paymentReport
function collectibilityWorksheetContent(loanReports, requestBody){
    const head = [
        {name: 'No', type: 'number'},
        {name: 'KSM', type: 'string'},
        {name: 'Realisasi', filterButton: true, type: 'date'},
        {name: 'Jatuh Tempo', filterButton: true, type: 'date'},
        {name: 'Besar Pinjaman', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Angs per Bulan', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Kredit Seharusnya', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Kredit Sebenarnya', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Tunggakan < 3 bulan', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Tunggakan > 3 bulan', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Lancar', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Perhatian', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Kurang Lancar', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Diragukan', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Macet', totalsRowFunction: 'sum', type: 'currency'}
    ]
    const contentType = head.map(obj => obj.type)
    const content = []

    loanReports.data.forEach((loanReport, index) => {

        const {loan, loanPayment, collectibility } = loanReport

        let expect_remaining = 0
        let real_remaining = 0
        let arrears_1 = 0
        let arrears_2 = 0

        loanPayment.forEach(payment => {

            const {monthly_loan_remaining, due_date} = payment
            const dateGap = new DateFormat(requestBody.end_date).diffDays(due_date)

            real_remaining += monthly_loan_remaining
            if(dateGap > 0) expect_remaining += monthly_loan_remaining

            if(dateGap < -90) return arrears_2 += monthly_loan_remaining
            else if(dateGap <= 0) return arrears_1 += monthly_loan_remaining
        })

        const {current, deliquent, doubtful, nonperforming, default: fail} = collectibility

        content.push([
            index + 1,
            loan.ksm.name,
            loan.loan_start,
            loan.loan_end,
            loan.total_loan,
            loanPayment[0].monthly_loan,
            expect_remaining,
            real_remaining,
            arrears_1,
            arrears_2,
            current,
            deliquent,
            doubtful,
            nonperforming,
            fail
        ])
    })

    return {head, content, contentType}
}
// table content for bbnsReport
function bbnsWorksheetContent({thisMonth, lastMonth}, coa = [], type = 'Aktiva'){
    const head = [
        {name: 'No', type: 'number'},
        {name: 'Kode', type: 'number'},
        {name: `${type}`, type: 'long_string'},
        {name: 'Akun', type: 'string'},
        {name: 'Saldo Awal', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Debit', totalsRowFunction: 'sum', type: 'currency'},
        {name: 'Kredit', totalsRowFunction: 'sum', type: 'currency'}
    ]
    const contentType = head.map(obj => obj.type)
    const content = []

    const fillContent = (lastMonth, thisMonth, coa) => {
        coa.forEach((item, index) => {
             const {id: id_coa, description} = item
             const {name: name_account} = item.account
             content.push([ index + 1, id_coa, description, name_account, 0, 0, 0])
        })
        lastMonth.forEach(item => {
            const index = content.findIndex(data => data[1] === item.id_coa)
            if(index !== -1){
                content[index][4] += item.debit - item.credit
            }
        })
        thisMonth.forEach(item => {
            const index = content.findIndex(data => data[1] === item.id_coa)
            if(index !== -1){
                content[index][5] += item.debit
                content[index][6] += item.credit
            }
        })
    }
    switch(type){
        case 'Aktiva':
            coa = coa.filter(item => item.account.id_category === 1)
            fillContent(lastMonth.aktiva, thisMonth.aktiva, coa)
            break
        case 'Pasiva':
            coa = coa.filter(item => item.account.id_category === 2)
            fillContent(lastMonth.pasiva, thisMonth.pasiva, coa)
            break
        default:
            break
    }

    return {head, content, contentType}
}
// format content
function formatContent(worksheet, contentType, contentLength, insertedRow){

    for(let i = 1; i <= contentLength; i++){

        contentType.forEach((type, index) => {

            let cell = worksheet.getRow(insertedRow + i).getCell(index + 1)

            switch(type){
                case 'number':
                    cell.alignment = {horizontal: 'center'}
                    break
                case 'date':
                    cell.alignment = {horizontal: 'center'}
                    cell.numFmt = 'yyyy/mm/dd'
                    break
                case 'currency':
                    cell.numFmt = '#,##0'
                    break
                default:
                    break
            } 
        })
    }
}
// Header Text
function fillHeader(worksheet, strings, columnStart, columnEnd, insertedRow){
    let i = 0
    strings.forEach(text => {
        let cell = worksheet.getRow(insertedRow).getCell(columnStart)
        cell.value = text
        cell.alignment = {horizontal: 'center', vertical:'middle'}
        switch(i){
            case 0:
                cell.font = { bold: true, size: 14 }
                break
            case 1:
                cell.font = { bold: true, size: 18 }
                break
            case 2:
                cell.font = { bold: true, size: 14 }
                break
            default:
                break
        }
        worksheet.mergeCells(`${columnStart}${insertedRow}:${columnEnd}${insertedRow}`)
        i ++
        insertedRow ++
    })
    return insertedRow
}
// column witdh by array
function columnWidth(worksheet, type){
    let i = 0
    worksheet.columns.forEach(column => {
        switch(type[i]){
            case 'number':
                column.width = 6
                break
            case 'date':
                column.width = 12
                break
            case 'currency':
                column.width = 13
                break
            case 'string':
                column.width = 25
                break
            case 'long_string':
                column.width = 40
                break
            default:
                break
        }       
        i++
    })
}
// merge columns
function mergeColumn(worksheet, value, columnStart, columnEnd, row, insertedRow, align = 'center', font = {}){
    let cell = worksheet.getCell(`${columnStart}${row + insertedRow}`)
    cell.value = value
    cell.alignment = {horizontal: align, vertical: 'middle', wrapText: true} 
    cell.font = font
    return worksheet.mergeCells(`${columnStart}${row + insertedRow}:${columnEnd}${row + insertedRow}`)
}
// fill content cell
function fillContents(worksheet, row, columnNum, arr, insertedRow, alignment, font = {}){

    arr.forEach(({data, type}) => { 

        let cell = worksheet.getRow(row + insertedRow).getCell(columnNum)
        cell.value = data

        switch(type){
            case 'number':
                cell.alignment = alignment || {horizontal: 'center'}
                cell.font = font
                break
            case 'date':
                cell.alignment = alignment || {horizontal: 'center'}
                cell.font = font
                break
            case 'percent':
                cell.alignment = alignment || {horizontal: 'right'}
                cell.value = data / 100
                cell.font = font
                cell.numFmt = '#,##0.00%'
                break
            case 'currency':
                cell.alignment = alignment || {horizontal: 'right'}
                cell.font = font
                cell.numFmt = '#,##0'
                break
            default:
                break
        } 
        columnNum ++
    })
}

module.exports = {ReportFactory}