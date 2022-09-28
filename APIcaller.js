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
const {
  uniqueDataArr,
  getAllProjectsByOrgId,
  uniqueOrgIds,
} = require('./builder')
const { getUniqueStatusCodes, getActionReport } = require('./APIutilities')
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
          resolve({
            status: response.status,
            statusText: response.statusText,
            orgID: tagObj.orgID,
            projectID: tagObj.projectID,
          })
        })
        .catch((err) =>
          resolve({
            status: err.response.status,
            statusText: err.response.statusText,
            orgID: tagObj.orgID,
            projectID: tagObj.projectID,
          })
        )
    })
    allPromises.push(promise)
  }
  let results = await Promise.all(allPromises)
  if (logStatusCodes === true) console.dir(results)
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
  let output
  switch (action) {
    case 'remove':
      output = await forAllTags(removeTag, newTagsArray)
      break
    case 'set':
      output = await forAllTags(setTag, newTagsArray)
      break
    case 'removeALL':
      output = await forAllTags(removeTag, currentTagsArray)
      break
    case 'getALL':
      output = await getAllProjectsByOrgId(uniqueOrgIds)
      console.dir(output, {
        depth: 2,
      })
      break
    case 'logONE':
      output = await forAllTags(setTag, newTagsArray)
      const sample = newTagsArray.filter((obj) =>
        obj.projectName.includes('strawberry')
      )
      console.dir(sample, { depth: null })
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
  console.dir(getActionReport(getUniqueStatusCodes(output), output), {
    depth: 1,
  })

  return output
}

takeAction('set')
// takeAction('getALL')
// takeAction('remove')
// takeAction('removeALL')
// takeAction('logONE')

module.exports = { takeAction }
