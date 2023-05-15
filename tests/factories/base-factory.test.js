const {BaseModel} = require('../../factories/base-factory')
const model = require('../../models')
const factory = new BaseModel(model.Test)

describe('Testing base factory', () => {

    describe('=> Code 201', () => {

        let output = {code: 201, status: true}

        test('Create', async() => {
            // recreate table
            await model.Test.sync({force: true})

            let input = await factory.create({first_name: 'Dwi', last_name: 'Julianto'})
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 200', () => {

        let output = {code: 200, status: true}

        test('Find All', async() => {

            let input = await factory.findAll()
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Find By PK', async() => {

            let input = await factory.findByPk(1)
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Find One', async() => {

            let input = await factory.findOne()
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Update', async() => {

            let input = await factory.update({first_name: 'Juliant', last_name: 'Dwyne'}, 1)
            expect(input).toEqual(expect.objectContaining(output))
        })

        test('Delete', async() => {

            let input = await factory.delete(1)
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

            let input = await factory.findByPk(2345)
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Update', async() => {

            let input = await factory.update({first_name: 'Dwi', last_name: 'Julianto'}, 1235)
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Delete', async() => {

            let input = await factory.delete(1234)
            expect(input).toEqual(expect.objectContaining(output))
        })
    })
})