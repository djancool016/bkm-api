const {ReportFactory} = require('../../factories/report-factory')
const {LoanPaymentFactory} = require('../../factories/loanPayment-factory')
const factory = new ReportFactory()
const loanPayment = new LoanPaymentFactory()


test('Loan Payment Report', async() => {

    await factory.prototypePaymentReport({
        year: 2023, 
        month: 1
    })
})