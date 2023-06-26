const {LoanPaymentFactory} = require('./loanPayment-factory')
const {TransactionLoanFactory} = require('./transactionLoan-factory')
const {LoanFactory} = require('./loan-factory')
const {TransactionFactory} = require('./transaction-factory')
const {CoaFactory} = require('./coa-factory')
const ExcelJs = require('exceljs')
const { DataLogger, DateFormat, StatusLogger } = require('../utils')

class ReportFactory {
    constructor(){
        this.loan = new LoanFactory
        this.loanPayment = new LoanPaymentFactory
        this.transactionLoan = new TransactionLoanFactory
        this.transaction = new TransactionFactory
        this.coa = new CoaFactory
    }

    // create payment report
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
                pay_loan: 0, pay_interest: 0, pay_bop: 0,
                remaining_loan: total_loan, remaining_interest: total_interest, remaining_bop: total_bop
            })
        })
        
        let loanIds = paymentReport.map(loan => loan.id_loan)

        // Find transaction loan data
        let transactionLoan = await this.transactionLoan.read({id_loan: loanIds, end_date})
        if(transactionLoan.status == false) return transactionLoan

        transactionLoan.data.forEach(obj => {
            
            let {id_type, trans_date, total} = obj.transaction
            let {id: id_loan} = obj.loan

            const index = paymentReport.findIndex(item => {
                return item.id_loan == id_loan
            })
            paymentReport[index].trans_date = trans_date

            let isLastMonth = new DateFormat(trans_date).diffDays(lastMonth) >= 0

            if(isLastMonth){
                switch(id_type){
                    case 4,39:
                        paymentReport[index].paid_loan += total 
                        break
                    case 5,40:
                        paymentReport[index].paid_interest += total
                        break
                    case 6,41:
                        paymentReport[index].paid_bop += total
                        break
                    default:
                        break
                }
            }else{
                switch(id_type){
                    case 4,39:
                        paymentReport[index].pay_loan += total
                        break
                    case 5,40:
                        paymentReport[index].pay_interest += total
                        break
                    case 6,41:
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
 
            paymentReport[index].remaining_loan = total_loan - paid_loan - pay_loan
            paymentReport[index].remaining_interest = total_interest - paid_interest - pay_interest
            paymentReport[index].remaining_bop = total_bop - paid_bop - pay_bop

        })

        let totalCurrent = 0
        let totalDeliquent = 0
        let totalDoubtful = 0
        let totalNonPerforming = 0
        let totalDefault = 0
        let totalAllRemainingLoan = 0
   
        for(let i = 0; i < paymentReport.length; i++){

            let loanPayment = await this.loanPayment.read({id_loan : paymentReport[i].id_loan})
            if(loanPayment.status == false) return loanPayment
            
            let {trans_date, remaining_loan, total_loan} = paymentReport[i]

            if(trans_date){
                let dateParts = trans_date.split("-")
                let newtransDate = `${dateParts[0]}-${dateParts[1].padStart(2,'0')}`
                // use this if ignore date, set all date to 1
                trans_date = new DateFormat(newtransDate)
            }
            totalAllRemainingLoan += remaining_loan

            let this_month_payment

            let collectibillity = {
                current: 0,
                deliquent: 0,
                doubtful: 0,
                nonperforming: 0,
                default: 0
            }

            let trueLoanCredit = total_loan

            loanPayment.data.forEach(obj => {
                
                let {
                    payment_no, due_date, 
                    loan_full: monthly_loan, loan_remaining, interest_full: monthly_interest, 
                    interest_remaining, is_settled
                } = obj
                
                let parts = due_date.split('-')
                let newDueDate = `${parts[0]}-${parts[1].padStart(2,'0')}-01`

                // chack if transaction is in due_date month
                let isThisMonth = trans_date? trans_date.diffDays(newDueDate) : 1

                // default
                if(isThisMonth < -270 || collectibillity.default > 0){
                    collectibillity.default += loan_remaining
                    totalDefault += loan_remaining
                }
                // non-performing
                else if(isThisMonth < -180 || collectibillity.nonperforming > 0){
                    collectibillity.nonperforming += loan_remaining
                    totalNonPerforming += loan_remaining
                }
                // doubtful
                else if(isThisMonth < -90 || collectibillity.doubtful > 0){
                    collectibillity.doubtful += loan_remaining
                    totalDoubtful += loan_remaining
                }
                // deliquent
                else if(isThisMonth <= 0 || collectibillity.deliquent > 0){
                    collectibillity.deliquent += loan_remaining
                    totalDeliquent += loan_remaining
                }
                // current
                else {
                    collectibillity.current += loan_remaining
                    totalCurrent += loan_remaining
                }

                if(isThisMonth <= 0) trueLoanCredit -= monthly_loan

                // chack if transaction is in 30 days from due_date
                if((isThisMonth <= 0 && isThisMonth >= -30) || (!this_month_payment && isThisMonth == 1)) {

                    this_month_payment = {
                        payment_no, due_date, loan_remaining, interest_remaining, monthly_loan, monthly_interest,is_settled
                    }
                }
            })

            paymentReport[i] = {
                ...paymentReport[i], 
                ['true_loan_credit']: trueLoanCredit,
                ['this_month_payment']: this_month_payment,
                ['collectibillity']: collectibillity
            }
        }

        let risk = {
            current: {
                total: totalCurrent, 
                loss_percent: 0.5, 
                loss_total: Math.round(totalCurrent * 0.5 / 10000) * 100,
                rating: Math.round(totalCurrent / totalAllRemainingLoan * 100000) / 1000 
            },
            deliquent: {
                total: totalDeliquent, 
                loss_percent: 0.5, 
                loss_total: Math.round(totalDeliquent * 0.5 / 10000) * 100,
                rating: Math.round(totalDeliquent / totalAllRemainingLoan * 100000) / 1000 
            },
            doubtful: {
                total: totalDefault, 
                loss_percent: 10, 
                loss_total: Math.round(totalDefault * 10 / 10000) * 100,
                rating: Math.round(totalDefault / totalAllRemainingLoan * 10000) / 1000 
            },
            nonperforming: {
                total: totalNonPerforming, 
                loss_percent: 50, 
                loss_total: Math.round(totalNonPerforming * 50 / 10000) * 100,
                rating: Math.round(totalNonPerforming / totalAllRemainingLoan * 100000) / 1000 
            },
            default: {
                total: totalDefault, 
                loss_percent: 100, 
                loss_total: Math.floor(totalDefault * 100 / 10000) * 100,
                rating: Math.round(totalDefault / totalAllRemainingLoan * 100000) / 1000 
            }      
        }
        return new DataLogger({data: {paymentReport, risk}}).log
    }

    // create credit, debit, and cash report
    async cashReport({ledger, requestBody}){

        if(ledger.status == false) return ledger
        let upk = []
        let ups = []
        let upl = []
        let bkm = []

        ledger.data.forEach(arr => {
            
            arr.account.forEach(account => {
                const transactionAccount = (unitManagement) => {
                    account?.transaction?.forEach(obj => {
                        let index = unitManagement.findIndex(data => data.id_coa == obj.id_coa)
                        if(index == -1) {
                            let cashFlow = {
                                id_coa: obj.id_coa, 
                                coa: obj.coa,
                                debit: 0,
                                credit: 0
                            }
                            switch(obj.id_register){
                                case 1:
                                    cashFlow.debit += obj.total
                                    break
                                case 2:
                                    cashFlow.credit += obj.total
                            }
                            return unitManagement.push(cashFlow)
                        }
                        if(obj.id_register == 1) return unitManagement[index].debit += obj.total
                        unitManagement[index].credit += obj.total
                    })  
                }

                transactionAccount(upk)
            })
        })
        let output = {
            upk
        }

        return new DataLogger({data:output}).log
    }

    // create a xls workbook
    async reportXls({requestBody, paymentReport}){

        const workbook = new ExcelJs.Workbook()

        if(paymentReport.status){
            this.paymentReportXls(paymentReport.data, requestBody, workbook)
            this.collectibillityReportXls(paymentReport.data, requestBody, workbook)
        }

        let buffer = await workbook.xlsx.writeBuffer()
        return new DataLogger({data: buffer}).log
    }

    // create payment report worksheet
    async paymentReportXls({paymentReport}, requestBody, workbook){

        const worksheet = workbook.addWorksheet('Angsuran', {
            pageSetup: {paperSize: 5, orientation:'landscape', fitToPage: true}
        })

        let content = []
        let contentType = [
            'number','string','date','currency','date','number',
            'currency','currency','currency','currency',
            'currency','currency','currency','currency',
            'string'
        ]
        let insertedRow = 1

        // START HEADER
        let headerText = [
            "DAFTAR RINCIAN ANGSURAN PINJAMAN KSM ANGGOTA",
            "BADAN KESWADAYAAN MASYARAKAT (BKM) SEJAHTERA",
            "KELURAHAN UNGARAN KECAMATAN UNGARAN BARAT",
            "Alamat: Jalan. MT. Haryono No.26  Tlp (024) 76911081 Ungaran 50511"
        ]
        insertedRow = fillHeader(worksheet, headerText, 'A', 'O', insertedRow)

        // Date report
        let{year, month}= requestBody
        let date = new DateFormat(`${year}-${month+1}`)
        date.addDays = -1
        date = `Angsuran : ${date.toLocaleString(false)}`
        mergeColumn(worksheet, date, 'M', 'O', 0, insertedRow, 'right', {bold: true})

        insertedRow ++

        paymentReport.forEach((item, index) => {
    
            let {current, deliquent, doubtful, nonperforming, default: failed} = item.collectibillity
            let remark

            if(failed) remark = 'Macet'
            else if(nonperforming) remark = 'Diragukan'
            else if(doubtful) remark = 'Kurang Lancar'
            else if(deliquent) remark = 'Perlu Perhatian'
            else if(current) remark = 'Lancar'
            else remark = 'Invalid Payment'

            content.push([
                index + 1,
                item.ksm_name,
                new Date(item.loan_start),
                item.total_loan,
                new Date(item.trans_date),
                item.this_month_payment.payment_no,
                item.pay_loan,
                item.pay_interest,
                item.pay_bop,
                item.pay_loan + item.pay_interest + item.pay_bop,
                item.remaining_loan,
                item.remaining_interest,
                item.remaining_bop,
                item.remaining_loan + item.remaining_interest + item.remaining_bop,
                remark
            ])
        })

        // CREATE TABLE
        worksheet.addTable({
            name: 'PaymentReport',
            ref: `A${insertedRow}`,
            headerRow: true,
            headerRowCount: 2,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'KSM'},
              {name: 'Tanggal Pencairan', filterButton: true},
              {name: 'Jumlah Pinjaman', totalsRowFunction: 'sum'},
              {name: 'Tanggal Angsuran', filterButton: true},
              {name: 'Angs ke'},
              {name: 'Angsuran Pokok', totalsRowFunction: 'sum'},
              {name: 'Angsuran Bunga 1.45%', totalsRowFunction: 'sum'},
              {name: 'Angsuran BOP 0.05%', totalsRowFunction: 'sum'},
              {name: 'Jumlah Angsuran', totalsRowFunction: 'sum'},
              {name: 'Sisa Pokok', totalsRowFunction: 'sum'},
              {name: 'Sisa Bunga', totalsRowFunction: 'sum'},
              {name: 'Sisa BOP', totalsRowFunction: 'sum'},
              {name: 'Jumlah Sisa', totalsRowFunction: 'sum'},
              {name: 'Keterangan'}
            ],
            rows: content
        })

        columnWidth(worksheet, contentType)
        formatContent(worksheet, contentType, content.length + 1, insertedRow)
        worksheet.getRow(insertedRow).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}

        return worksheet
    }

    // create collectibility worksheet
    async collectibillityReportXls({paymentReport, risk}, requestBody, workbook){

        const worksheet = workbook.addWorksheet('Kolektibilitas', {
            pageSetup: {paperSize: 5, orientation:'landscape', fitToPage: true}
        })

        let content = []
        let contentType = [
            'number','string','date','date',
            'currency','currency','currency','currency','currency',
            'currency','currency','currency','currency',
        ]
        let insertedRow = 1

        // START HEADER
        let headerText = [
            "DAFTAR RINCIAN ANGSURAN PINJAMAN KSM ANGGOTA",
            "BADAN KESWADAYAAN MASYARAKAT (BKM) SEJAHTERA",
            "KELURAHAN UNGARAN KECAMATAN UNGARAN BARAT",
            "Alamat: Jalan. MT. Haryono No.26  Tlp (024) 76911081 Ungaran 50511"
        ]
        insertedRow = fillHeader(worksheet, headerText, 'A', 'M', insertedRow)

        // Date report
        let{year, month}= requestBody
        let date = new DateFormat(`${year}-${month+1}`)
        date.addDays = -1
        date = `Angsuran : ${date.toLocaleString(false)}`
        mergeColumn(worksheet, date, 'K', 'M', 0, insertedRow, 'right', {bold: true})

        insertedRow ++

        paymentReport.forEach((item, index) => {

            content.push([
                index + 1,
                item.ksm_name,
                new Date(item.loan_start),
                new Date(item.loan_end),
                item.total_loan,
                item.pay_loan,
                item.true_loan_credit,
                item.remaining_loan,
                item.collectibillity.current,
                item.collectibillity.deliquent,
                item.collectibillity.doubtful,
                item.collectibillity.nonperforming,
                item.collectibillity.default
            ])
        })

        // CREATE TABLE
        worksheet.addTable({
            name: 'CollectibilityReport',
            ref: `A${insertedRow}`,
            headerRow: true,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'KSM'},
              {name: 'Tanggal Realisasi', filterButton: true},
              {name: 'Tanggal Jatuh Tempo', filterButton: true},
              {name: 'Jumlah Pinjaman', totalsRowFunction: 'sum'},
              {name: 'Angsuran Pinjaman', totalsRowFunction: 'sum'},
              {name: 'Saldo Kredit Seharusnya', totalsRowFunction: 'sum'},
              {name: 'Saldo Kredit Sebenarnya', totalsRowFunction: 'sum'},
              {name: 'Lancar', totalsRowFunction: 'sum'},
              {name: 'Perhatian', totalsRowFunction: 'sum'},
              {name: 'Kurang Lancar', totalsRowFunction: 'sum'},
              {name: 'Diragukan', totalsRowFunction: 'sum'},
              {name: 'Macet', totalsRowFunction: 'sum'}
            ],
            rows: content
        })

        columnWidth(worksheet, contentType)
        formatContent(worksheet, contentType, content.length + 1, insertedRow)
        worksheet.getRow(insertedRow).alignment = {horizontal: 'center', vertical: 'middle', wrapText: true}


        // PERCENTASE RESIKO
        mergeColumn(worksheet, 'Persentase Resiko', 'A', 'B', content.length + 2, insertedRow, 'left')
        let loss_percent = [
            {data: risk.current.loss_percent, type: 'percent'},
            {data: risk.deliquent.loss_percent, type: 'percent'},
            {data: risk.doubtful.loss_percent, type: 'percent'},
            {data: risk.nonperforming.loss_percent, type: 'percent'},
            {data: risk.default.loss_percent, type: 'percent'}
        ]
        fillContents(worksheet, content.length + 2, 9, loss_percent , insertedRow)
        insertedRow ++
        
        // RR and NPL
        mergeColumn(worksheet, 'RR / NPL', 'A', 'B', content.length + 2, insertedRow, 'left')
        let rating = [
            {data: risk.current.rating, type: 'percent'},
            {data: risk.deliquent.rating, type: 'percent'},
            {data: risk.doubtful.rating, type: 'percent'},
            {data: risk.nonperforming.rating, type: 'percent'},
            {data: risk.default.rating, type: 'percent'}
        ]
        fillContents(worksheet, content.length + 2, 9, rating , insertedRow)
        insertedRow ++
        
        // NILAI RESIKO
        mergeColumn(worksheet, 'Nilai Resiko', 'A', 'B', content.length + 2, insertedRow, 'left')
        let loss_total = [
            {data: risk.current.loss_total, type: 'currency'},
            {data: risk.deliquent.loss_total, type: 'currency'},
            {data: risk.doubtful.loss_total, type: 'currency'},
            {data: risk.nonperforming.loss_total, type: 'currency'},
            {data: risk.default.loss_total, type: 'currency'}
        ]
        fillContents(worksheet, content.length + 2, 9, loss_total , insertedRow, null, {bold: true})

        return worksheet
    }

    // create cost/income worksheet
    async costIncomeReportXls({risk} ,cashReport, requestBody, workbook){

        const worksheet = workbook.addWorksheet('Laba-Rugi', {
            pageSetup: {paperSize: 5, orientation:'potrait', fitToPage: true}
        })

        let insertedRow = 1

        // START HEADER
        let headerText = [
            "DAFTAR RINCIAN LABA/RUGI",
            "BADAN KESWADAYAAN MASYARAKAT (BKM) SEJAHTERA",
            "KELURAHAN UNGARAN KECAMATAN UNGARAN BARAT",
            "Alamat: Jalan. MT. Haryono No.26  Tlp (024) 76911081 Ungaran 50511"
        ]
        insertedRow = fillHeader(worksheet, headerText, 'A', 'C', insertedRow) + 1

        // Date report
        let{year, month}= requestBody
        let date = new DateFormat(`${year}-${month+1}`)
        date.addDays = -1
        date = `Angsuran : ${date.toLocaleString(false)}`
        mergeColumn(worksheet, date, 'A', 'C', 0, insertedRow, 'right', {bold: true})

        insertedRow ++
        let i = 1

        let totalIncome = 0
        let totalCost = 0
        let totalRisk = 0

        let getContent = (data) => {
            return Object.entries(data)
            .reduce((acc, [key, value]) => {
                acc[key] = value.map(item => [i++, item.description, item.total]);
                return acc;
            }, {})
        }

        let incomeContent = Object.entries(getContent(cashReport.income))
            .flatMap(([key, value]) => value.map(([id, description, value]) => {
                description = `${String(key).toUpperCase()} - ${description}`
                totalIncome += value
                return [id, description, value]
            }))

        i = 1
        let costContent = Object.entries(getContent(cashReport.cost))
            .flatMap(([key, value]) => value.map(([id, description, value]) => {
                description = `${String(key).toUpperCase()} - ${description}`
                totalCost += value
                return [id, description, value]
            }))

        i = 1
        let riskContent = Object.entries(risk)
        .map(([key, {loss_total}]) => {
            let description
            totalRisk += loss_total
            switch(key){
                case 'current':
                    description = `Lancar`
                    break
                case 'deliquent':
                    description = `Perhatian`
                    break
                case 'doubtful':
                    description = `Kurang Lancar`
                    break
                case 'nonperforming':
                    description = `Diragukan`
                    break
                default:
                    description = `Macet`
                    break
            }
            return [i++, description, loss_total]
        })

        // CREATE TABLE
        worksheet.addTable({
            name: 'IncomeReport',
            ref: `A${insertedRow}`,
            headerRow: true,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'PENDAPATAN'},
              {name: '(RP)', totalsRowFunction: 'sum'}
            ],
            rows: incomeContent
        })

        insertedRow += incomeContent.length + 2

        worksheet.addTable({
            name: 'CostReport',
            ref: `A${insertedRow}`,
            headerRow: true,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'BELANJA/BIAYA'},
              {name: '(RP)', totalsRowFunction: 'sum'}    
            ],
            rows: costContent
        })

        insertedRow += costContent.length + 2

        worksheet.addTable({
            name: 'RiskReport',
            ref: `A${insertedRow}`,
            headerRow: true,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'RESIKO KREDIT'},
              {name: '(RP)', totalsRowFunction: 'sum'}    
            ],
            rows: riskContent
        })

        insertedRow += 7

        worksheet.addTable({
            name: 'CostIncome',
            ref: `A${insertedRow}`,
            headerRow: true,
            totalsRow: true,
            style: {
              theme: 'TableStyleMedium2',
              showRowStripes: true,
            },
            columns: [
              {name: 'No'},
              {name: 'LABA/RUGI'},
              {name: '(RP)', totalsRowFunction: 'sum'}    
            ],
            rows: [
                [1, 'Total Pendapatan', totalIncome],
                [2, 'Total Pengeluaran', totalCost * -1],
                [3, 'Total Resiko Kredit', totalRisk * -1]
            ]
        })


        let col = worksheet.getColumn(2)
        col.width = 60

        col = worksheet.getColumn(3)
        col.width = 20
        col.numFmt = '#,##0'

        return worksheet
    }

    // create cash flow wroksheet
    async cashFlowReportXls(){
        
    }
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
function mergeColumn(worksheet, value, columnStart, columnEnd, row, insertedRow, align = 'center', font = {}){
    let cell = worksheet.getCell(`${columnStart}${row + insertedRow}`)
    cell.value = value
    cell.alignment = {horizontal: align, vertical: 'middle', wrapText: true} 
    cell.font = font
    return worksheet.mergeCells(`${columnStart}${row + insertedRow}:${columnEnd}${row + insertedRow}`)
}

module.exports = {ReportFactory}