const {LkmFactory} = require('../../factories/lkm-factory')
const factory = new LkmFactory()

describe('Testing base factory', () => {

    describe('=> Code 201', () => {
        let output = {code: 201, status: true}

        test('Create', async() => {
            let input = await factory.create({
                id_kelurahan: "12345",
                name: 'KSM Test 1',
                phone: '024123123123',
                address: 'Jl. MT Haryono 16B'
            })
            expect(input).toEqual(expect.objectContaining(output))
        })
    })

    describe('=> Code 200', () => {
        let output = {code: 200, status: true}
        let latestID

        test('Find Latest Inserted', async() => {
            let input = await factory.read({findLatest: true})
            latestID = input.data.id
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Find By Pk', async() => {
            let input = await factory.read({id: latestID})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Update', async() => {
            let input = await factory.update({id: latestID, name:'Test Update KSM'})
            expect(input).toEqual(expect.objectContaining(output))
        })
        test('Delete', async() => {
            let input = await factory.delete(latestID)
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