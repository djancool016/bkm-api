const {titleCase, dateToCode} = require('../../utils/baseUtils')

test('Properly change string to title case', async () => {
    let word = titleCase('heLlo wOrlD')

    expect(word).toEqual('Hello World')
})

test('Properly change date to code', async () => {
    let code = dateToCode("2023-05-19")
    expect(code).toEqual('230519')
})

