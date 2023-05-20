const {LoanFactory} = require('../../factories/loan-factory')
const factory = new LoanFactory()

describe('Testing base factory', () => {

    describe('=> Code 201', () => {

        let output = {code: 201, status: true}

        test('Create', async() => {

            let input = await factory.create({
                id_ksm: 1, 
                total_loan: 20000000, 
                loan_duration: 12, 
                loan_interest: 1.45
            })
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 200', () => {

        let output = {code: 200, status: true}

        test('Find All', async() => {

            let input = await factory.read({})
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Find By PK', async() => {

            let input = await factory.read({id: 1})
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Find Latest', async() => {

            let input = await factory.read({findLatest: true})
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Update', async() => {
            let {data:{id}} = await factory.read({findLatest: true})
            let input = await factory.update({
                id: id,
                total_loan: 25000000, 
                loan_duration: 12
            })
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Loan Approval', async() => {
            let input = await factory.loanApproval(id = 1)
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Loan PaidOff', async() => {
            let input = await factory.paidOff(id = 1)
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Delete', async() => {

            let {data:{id}} = await factory.read({findLatest: true})
            let input = await factory.delete(id)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 400', () => {

        let output = {code: 400, status: false}

        test('Create', async() => {

            let input = await factory.create({id: 'a', first_name: 'Dwi', last_name: 'Julianto'})
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 404', () => {

        let output = {code: 404, status: false}

        test('Find By PK', async() => {

            let input = await factory.read({id: 123})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Update', async() => {

            let input = await factory.update({id: 12345, first_name: 'Dwi', last_name: 'Julianto'})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Delete', async() => {

            let input = await factory.delete(1234)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })
})