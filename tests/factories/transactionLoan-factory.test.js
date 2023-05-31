const {TransactionLoanFactory} = require('../../factories/transactionLoan-factory')
const factory = new TransactionLoanFactory()

describe('Testing base factory', () => {

    describe('=> CheckPayments', () => {
        let output = {code: 201, status: true}

        test('200', async() => {
            let input = await factory.checkPayments({
                transactionLoan:{
                    id_loan: 1, 
                    id_coa: 16,
                    total: 200000
                }
            })
            console.log(input)
            //expect(input).toEqual(expect.objectContaining(output))
        })
    })
})