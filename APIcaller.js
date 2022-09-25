require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const request = require('superagent')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.common['Content-Type'] = 'application/json'

const { tagsArray } = require('./wrangler')

//TEST DATA
let xORGID = '99692bde-50ab-48e5-bb4a-2f093bac259e'
let xPROJECTID = '347e7466-4b27-4579-b988-84142f3d69d1'

let testObj = {
  orgID: xORGID,
  projectID: xPROJECTID,
  cat: 'pants',
  tagName: 'thingy-jig',
}
//Logging API calls

async function getOneProject({ orgID, projectID }) {
  //TODO: Implement try/catch error handling
  const response = await axios.get(`${snykAPIurl}${orgID}/project/${projectID}`)
  const summary = {
    orgID: orgID,
    status: response.status,
    projectName: response.data.name,
    tags: response.data.tags,
    projectID: response.data.id,
    origin: response.data.origin,
    type: response.data.type,
    browseUrl: response.data.browseUrl,
    branch: response.data.branch,
    targetReference: response.data.targetReference,
  }
  return summary
}

async function logAllProjects(tagsArray) {
  const allPromises = []
  for (const tagObj of tagsArray) {
    const promise = getOneProject(tagObj)
    allPromises.push(promise)
  }
  const allProjects = await Promise.all(allPromises)
  console.dir(allProjects, { depth: null })
  return allProjects
}

async function logAllTags(tagsArray) {
  const allPromises = []
  for (const tagObj of tagsArray) {
    const promise = getOneProject(tagObj)
    allPromises.push(promise)
  }
  const allProjects = await Promise.all(allPromises)
  console.dir(allProjects, { depth: null })

  return allProjects
}

// function setTag({ orgID, projectID, tagName }) {
//   const payload = { key: 'service', value: 'tagName' }

//   const response = axios.post(
//     `${snykAPIurl}${orgID}/project/${projectID}/tags`,
//     payload
//   )
//   return response
// }

const base = {
  Authorization: AUTH_TOKEN,
  'Content-Type': 'application/json',
}

function setTag({ orgID, projectID, tagName }) {
  const payload = { key: 'service', value: 'tagName' }

  const response = request
    .post(`${snykAPIurl}${orgID}/project/${projectID}/tags`)
    .set(base)
    .send(payload)

  return response
}
// function setTag({ orgID, projectID, tagName }) {
//   const payload = { key: 'service', value: 'tagName' }

//   const response = axios.post(
//     `${snykAPIurl}${orgID}/project/${projectID}/tags`,
//     payload
//   )
//   return response
// }

function removeTag({ orgID, projectID, tagName }) {
  const payload = { key: 'service', value: 'tagName' }

  const response = axios.post(
    `${snykAPIurl}${orgID}/project/${projectID}/tags/remove`,
    payload
  )
  return response
}

async function setAllTags(tagsArray) {
  const allPromises = []
  for (const tagObj of tagsArray) {
    const promise = new Promise((resolve, reject) => {
      setTag(tagObj)
        .then(() => {
          console.log(response)
          resolve(response)
        })
        .catch((err) => resolve(['fail', tagObj.projectID, err]))
    })
    allPromises.push(promise)
  }
  let results = await Promise.all(allPromises)
  console.log(results)
}

async function removeAllTags(tagsArray) {
  const allPromises = []
  for (const tagObj of tagsArray) {
    const promise = new Promise((resolve, reject) => {
      removeTag(tagObj)
        .then(() => {
          console.log(response)
          resolve(response)
        })
        .catch((err) => resolve(['fail', tagObj.projectID, err]))
    })
    allPromises.push(promise)
  }
  let results = await Promise.all(allPromises)
  console.log(results)
}
setAllTags(tagsArray)
// removeAllTags(tagsArray)
// logAllProjects(tagsArray)

module.exports = { getOneProject, logAllProjects, removeAllTags, setAllTags }
