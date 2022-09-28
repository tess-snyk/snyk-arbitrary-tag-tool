// THESE TESTS ARE NOT MOCKED! They act on the actual API and could mess up your actual data.
// This is a very bad way to do testing. Do not uncomment or run these tests

// TODO: Create a mock API for these tests to call.

// const axios = require('axios')
// const fs = require('fs')

// const { takeAction } = require('./APIcaller')

// jest.setTimeout(1000000)

// describe('Reversing actions such as ', () => {
//   test('set - remove should leave data unchanged', async () => {
//     await takeAction('removeALL')
//     const before = await takeAction('getALL')
//     await takeAction('set')
//     await takeAction('remove')
//     const after = await takeAction('getALL')
//     expect(before).toEqual(after)
//     return
//   })

//   test('remove - set should leave data unchanged', async () => {
//     await takeAction('removeALL')
//     const before = await takeAction('getALL')
//     await takeAction('remove')
//     await takeAction('set')
//     await takeAction('remove')
//     const after = await takeAction('getALL')
//     expect(before).toEqual(after)
//     return
//   })
// })
