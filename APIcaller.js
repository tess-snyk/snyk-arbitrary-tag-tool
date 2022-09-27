// require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const request = require('superagent')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.common['Content-Type'] = 'application/json'

const { buildTagArraysFromBBDataSnykAPI } = require('./wrangler')

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

  return response
}

async function logOneProject(getCallResponse) {
  const response = getCallResponse
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
  console.log(summary)
}

// async function logAllProjects(newTagsArray) {
//   const allPromises = []
//   for (const tagObj of newTagsArray) {
//     const promise = getOneProject(tagObj)
//     allPromises.push(promise)
//   }
//   const allProjects = await Promise.all(allPromises)
//   console.dir(allProjects, { depth: null })
//   return allProjects
// }

function setTag({ orgID, projectID, tag }) {
  const payload = tag

  const response = axios.post(
    `${snykAPIurl}${orgID}/project/${projectID}/tags`,
    payload
  )
  return response
}

async function forAllTags(
  func,
  newTagsArray,
  logStatusCodes = true,
  logDetails = false
) {
  const allPromises = []
  for (const tagObj of newTagsArray) {
    const promise = new Promise((resolve, reject) => {
      func(tagObj)
        .then((response) => {
          resolve([response.status, tagObj.projectID, response])
        })
        .catch((err) =>
          resolve([err.response.status, tagObj.projectID, err.response])
        )
    })
    allPromises.push(promise)
  }
  let results = await Promise.all(allPromises)
  if (logStatusCodes === true) console.dir(results, { depth: 1 })
  if (logDetails === true) {
  }

  return results
}

function removeTag({ orgID, projectID, tag }) {
  const payload = tag

  const response = axios.post(
    `${snykAPIurl}${orgID}/project/${projectID}/tags/remove`,
    payload
  )
  return response
}

async function takeAction(action) {
  let { newTagsArray, currentTagsArray } =
    await buildTagArraysFromBBDataSnykAPI()
  switch (action) {
    case 'remove':
      await forAllTags(removeTag, newTagsArray)
      break
    case 'set':
      await forAllTags(setTag, newTagsArray)
      break
    case 'removeALL':
      await forAllTags(removeTag, currentTagsArray)
      break
    default:
      console.log('that is not an option')
  }
  const tagsBefore = currentTagsArray.length
  console.log(`Total tags before action: ${tagsBefore}`)
  ;({ newTagsArray, currentTagsArray } =
    await buildTagArraysFromBBDataSnykAPI())
  const tagsAfter = currentTagsArray.length
  console.log(`Total tags after action: ${tagsAfter}`)
  const difference = Math.abs(tagsBefore - tagsAfter)
  console.log(`${difference} tags updated`)
}

// takeAction('set')
// takeAction('remove')
// takeAction('removeALL')
// setTags(newTagsArray)
// removeTags(newTagsArray)
// logAllProjects(newTagsArray)
// getOneProject(testObj)

// TAG APOCALYPSE WARNING WARNING WILL DELETE ALL ALL ALL TAGS IF YOU UNCOMMENT THE LINE BELOW
// removeTags(currentTagsArray)
// console.log('newTagsArray', newTagsArray)
// console.log('newTagsArray length', newTagsArray.length)

// const sample = newTagsArray.filter((obj) => obj.projectName.includes('strawberry'))
// console.log(sample)
// console.log('tag Apocalype Array', currentTagsArray)

module.exports = { getOneProject }