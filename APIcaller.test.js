const { removeAllTags, setAllTags } = require('./APIcaller')
const request = require('supertest')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN
const co = require('co')

const { projectCount, tagsArray, tagApocalypseArray } = require('./wrangler')
const utils = require('./APIutilities')

const base = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json',
}

// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
// axios.defaults.headers.common['Content-Type'] = 'application/json'

//TEST DATA
let xORGID = '99692bde-50ab-48e5-bb4a-2f093bac259e'
let xPROJECTID = '347e7466-4b27-4579-b988-84142f3d69d1'

let testObj = {
  orgID: xORGID,
  projectID: xPROJECTID,
  cat: 'pants',
  tagName: 'thingy-jig',
}

describe('Snyk API endpoint', () => {
  test('should return 200 status code', async () => {
    const response = await request(snykAPIurl)
      .get(`${xORGID}/project/${xPROJECTID}`)
      .set(base)

    expect(response.statusCode).toBe(200)
  })
})

// {
//   projectName: 'tess-snyk/tag-demo-service-5(main):terraform/modules/storage/inputs.tf',
//   projectID: '78a622fc-f148-448b-8709-e968d9cde31e',
//   orgName: 'Tag-Solution-2',
//   orgID: '99692bde-50ab-48e5-bb4a-2f093bac259e',
//   tags: [],
//   tag: { key: 'service', value: 'tag-demo-service-5' }
// },

// co(function* () {
//   yield removeAllTags(tagApocalypseArray)

//   describe('Snyk API endpoint', () => {
//     test('should return 200 status code', async () => {
//       const response = await request(snykAPIurl)
//         .get(`${xORGID}/project/${xPROJECTID}`)
//         .set(base)
//       console.log(response.data)
//       expect(response.statusCode).toBe(200)
//       return
//     })
//   })
// })

// test('inside co function', async () => {
//     const response = yield APIcaller.getOneProject(testObj)
//     console.log(response)
//     expect(response.statusCode).toBe(200)
//   })

// test('chain requests', async () => {

// }

// import request from "supertest";

// const baseUrl = 'https://jsonplaceholder.typicode.com/';

// describe('Todos endpoint', () => {
// 	it('should return a 200 status code', async () => {
// 		const response = await request(baseUrl)
// 			.get('todos/1');

// 		expect(response.statusCode).toBe(200);
// 	});
// })
