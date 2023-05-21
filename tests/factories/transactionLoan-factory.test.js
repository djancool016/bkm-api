const {TransactionLoanFactory} = require('../../factories/transactionLoan-factory')
const factory = new TransactionLoanFactory()

describe('Testing base factory', () => {

    describe('=> Code 201', () => {
        let output = {code: 201, status: true}

        test('Create', async() => {
            let input = await factory.create({
                id_loan: 1, 
                id_transaction: 1
            })
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 200', () => {
        let output = {code: 200, status: true}

        test('Find By Pk', async() => {
            let input = await factory.read({id: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Find By Id Transaction', async() => {
            let input = await factory.read({id_transaction: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Find By Id Loan', async() => {
            let input = await factory.read({id_loan: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Find By Id Ksm', async() => {
            let input = await factory.read({id_ksm: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Delete', async() => {
            let input = await factory.delete(1)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 400', () => {
        let output = {code: 400, status: false}
    })

    describe('=> Code 404', () => {
        let output = {code: 404, status: false}
    })
})