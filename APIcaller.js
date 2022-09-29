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

function logSummary(allProjectsOutput) {
  let summary = []
  for (response of allProjectsOutput) {
    let orgObj = response.data
    console.log(`ORG NAME: ${orgObj.org.name} \n 
                 ORG ID: $${orgObj.org.id}`)
    orgObj.projects.forEach((project) => logOneProject(project, orgObj.org.id))
  }
}

async function logOneProject(getCallResponse, orgID) {
  const response = getCallResponse
  // console.log('response', response)
  const summary = {
    orgID: orgID,
    projectName: response.name,
    tags: response.tags,
    projectID: response.id,
    origin: response.origin,
    type: response.type,
    browseUrl: response.browseUrl,
    branch: response.branch,
    targetReference: response.targetReference,
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

async function forAllTags(func, tagsArray) {
  if (func === setTag && tagsArray.length === 0) {
    console.log(`MESSAGE: newTagsArray is empty. There are no new tags to apply. \n
      Troubleshooting:\n
      - Check if you have already added the tags. This tool does not make requests to the API for duplicate tags on the same project. \n
      - Check you are using the correct and most up to date bitbucket-cloud-import-targets.json file.\n
      Exiting...`)
    return []
  } else if (func === removeTag && tagsArray.length === 0) {
    console.log(`MESSAGE: The tags array is empty. There are no matching tags to remove\n
    Exiting...`)

    return []
  }

  const allPromises = []
  for (const tagObj of tagsArray) {
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
        .catch((err) => {
          resolve({
            status: err.response.status,
            statusText: err.response.statusText,
            orgID: tagObj.orgID,
            projectID: tagObj.projectID,
          })
        })
    })
    allPromises.push(promise)
  }
  let results = await Promise.all(allPromises)

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
  let { newTagsArray, newTagsOnlyArray, currentTagsArray } =
    await buildTagArraysFromBBDataSnykAPI()

  let output
  switch (action) {
    //'removeBBtags' removes all tags listed in the bitbucket JSON file
    case 'removeBBtags':
      output = await forAllTags(removeTag, newTagsArray)
      break
    //'set' applies tags from the bitbucket JSON file that have not already been applied
    case 'set':
      output = await forAllTags(setTag, newTagsOnlyArray)
      break
    // 'removeALL' removes ALL tags currently applied, irrespective of what is in the BB JSON file
    case 'removeALL':
      output = await forAllTags(removeTag, currentTagsArray)
      break
    // 'logALL' logs all projects to the command line
    case 'logALL':
      output = await getAllProjectsByOrgId(uniqueOrgIds)
      logSummary(output)
      break
    default:
      console.log('that is not an option')
  }

  const logOutputReport = async (output, action) => {
    console.log(
      `${output.length} requests made across ${uniqueOrgIds.length} orgs`
    )
    console.dir(getActionReport(getUniqueStatusCodes(output), output), {
      depth: 1,
    })

    if (output.length > 0 && action != 'logALL') {
      const tagsBefore = currentTagsArray.length
      console.log(`Total tags before action: ${tagsBefore}`)
      ;({ newTagsArray, currentTagsArray } =
        await buildTagArraysFromBBDataSnykAPI())
      const tagsAfter = currentTagsArray.length
      console.log(`Total tags after action: ${tagsAfter}`)
      const difference = tagsAfter - tagsBefore
      console.log(
        `${Math.abs(difference)} tags ${difference > 0 ? 'added' : 'removed'}`
      )
    }
  }

  logOutputReport(output, action)
  return output
}

// takeAction('set')
// takeAction('logALL')
// takeAction('removeBBtags')
takeAction('removeALL')

module.exports = { takeAction }
