const {AccountFactory} = require('../../factories/account-factory')
const factory = new AccountFactory()

describe('Testing base factory', () => {

    describe('=> Code 201', () => {

        let output = {code: 201, status: true}

        test('Create', async() => {

            let input = await factory.create({code: "TestCode", description: 'TestingCode'})
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
            console.log(input.data)
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Update', async() => {
            let {data:{id}} = await factory.read({findLatest: true})
            let input = await factory.update({id: id, code: 'TestCode2'})
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