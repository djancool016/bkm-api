const {LoanPaymentFactory} = require('../../factories/loanPayment-factory')
const {LoanFactory} = require('../../factories/loan-factory')
const factory = new LoanPaymentFactory()
const loanFactory = new LoanFactory()

describe('Testing LoanPaymentFactory', () => {

    describe('=> Code 201', () => {

        let output = {code: 201, status: true}

        test('Bulk Create', async() => {
            let {data:{is_valid}} = await loanFactory.read({id: 1})
            if(is_valid == 0) await loanFactory.loanApproval(1)

            let input = await factory.create(1)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 200', () => {

        let output = {code: 200, status: true}

        test('Find By Loan ID', async() => {
            let input = await factory.read({id_loan: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Pay Loan', async() => {
            let input = await factory.update({id_loan: 1, pay_loan: 3000000})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Pay Interest', async() => {
            let input = await factory.update({id_loan: 1, pay_interest: 1000000})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Bulk Delete', async() => {
            let input = await factory.delete(1)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })
})