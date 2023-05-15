const {titleCase} = require('../../utils/baseUtils')

test('Properly change string to title case', async () => {
    let word = titleCase('heLlo wOrlD')

    expect(word).toEqual('Hello World')
})
