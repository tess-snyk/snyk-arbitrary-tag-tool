require('dotenv').config()
const axios = require('axios')
const fs = require('fs')

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
async function logOneProject({ orgID, projectID }) {
  //TODO: Implement try/catch error handling
  const response = await axios.get(`${snykAPIurl}${orgID}/project/${projectID}`)
  const summary = {
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
  console.log(summary)
  return response.data
}

async function logAllProjects(tagsArray) {
  const allPromises = []
  for (const tagObj of tagsArray) {
    const promise = logOneProject(tagObj)
    allPromises.push(promise)
  }
  const allProjects = await Promise.all(allPromises)
  console.log(allProjects)
}

async function setTag({ orgID, projectID, tagName }) {
  const payload = { key: 'service', value: tagName }
  try {
    const res = await axios.post(
      `${snykAPIurl}${orgID}/project/${projectID}/tags`,
      payload
    )
  } catch (res) {
    console.log(res.response.data)
  }
}

async function removeTag({ orgID, projectID, tagName }) {
  const payload = { key: 'service', value: tagName }
  //TODO: IMPLEMENT TRY/CATCH ERROR HANDLING
  const res = await axios.post(
    `${snykAPIurl}${orgID}/project/${projectID}/tags/remove`,
    payload
  )
}

function setAllTags(tagsArray) {
  for (const tagObj of tagsArray) {
    setTag(tagObj)
  }
}

function removeAllTags(tagsArray) {
  for (const tagObj of tagsArray) {
    removeTag(tagObj)
  }
}
setAllTags(tagsArray)
// removeAllTags(tagsArray)
// logAllProjects(tagsArray)
