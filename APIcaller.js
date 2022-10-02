const axios = require('axios')
const fs = require('fs')
const request = require('superagent')
const readline = require('readline')

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

async function getOneProject({ orgID, projectID }) {
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
            tagObj: tagObj,
          })
        })
        .catch((err) => {
          try {
            resolve({
              status: err.response.status,
              statusText: err.response.statusText,
              orgID: tagObj.orgID,
              projectID: tagObj.projectID,
              tagObj: tagObj,
            })
          } catch {
            resolve({
              status: 'client side error. Requests not sent',
              message: err.message,
              err: err,
              tagObj: tagObj,
            })
          }
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

    if (output.length > 0 && action != 'logALL') {
      const tagsBefore = currentTagsArray.length
      console.log(`Total tags before action: ${tagsBefore}`)
      try {
        ;({ newTagsArray, currentTagsArray } =
          await buildTagArraysFromBBDataSnykAPI())
        const tagsAfter = currentTagsArray.length
        console.log(`Total tags after action: ${tagsAfter}`)
        const difference = tagsAfter - tagsBefore
        console.log(
          `${Math.abs(difference)} tags ${difference > 0 ? 'added' : 'removed'}`
        )
        getActionReport(getUniqueStatusCodes(output), output)
      } catch {
        console.log(
          'unable to rebuild tag array for comparison. This could be due to rate limiting'
        )
      }
    }
  }

  logOutputReport(output, action)
  return output
}

// Magic Menu

function cliTagger() {
  console.log(`
  The following actions can be performed: \n
  1. Set tags in alignment with bitbucket data. \n
  2. Log all projects from snyk database. \n
  3. Remove previously set tags (performed by action 1). \n
  4. Remove ALL tags from snyk database, including those unrelated to bitbucket data. PLEASE NOTE: This action cannot be undone.
  `)

  pressEnter()
}

cliTagger()

function pressEnter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question(
    'Which action would you like to perform?',
    function (actionToPerform) {
      rl.close()
      switch (actionToPerform) {
        case '1':
          console.log('set')
          // takeAction('set')
          cliTagger()
          break
        case '2':
          console.log('logALL')
          // takeAction('logALL')
          cliTagger()
          break
        case '3':
          console.log('removeBBtags')
          // takeAction('removeBBtags')
          cliTagger()
          break
        case '4':
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })
          rl.question(
            `\x1b[31mThis action will remove ALL Tags (including those unrelated to bitbucket data), are you sure you want to do this? If so, type 'remove' to remove ALL Tags:\x1b[0m `,
            function (areYouSure) {
              rl.close()
              if (areYouSure === 'remove') {
                console.log('removeALL')
                // takeAction('removeALL')
                cliTagger()
              } else {
                console.log(`You entered '${areYouSure}' - no tags were removed`)
                cliTagger()
              }
            }
          )
          break
        default:
          console.log('Sorry, that is not an option, please enter 1, 2, 3 or 4')
          cliTagger()
      }
    }
  )
}

// takeAction('set') // set tags in alignment with bitbucket data
// takeAction('logALL') // log all projects from snyk database (to check manually if tags have been applied/removed correctly)
// takeAction('removeBBtags') // remove tags added with the function takeAction("set") - the tags derived from bitbucket data
// takeAction('removeALL') // remove ALL tags from snyk database, including those unrelated to bitbucket data. This cannot be undone.

// async function loop() {
//   let more = true
//   while (more === true) {
//     try {
//       await takeAction('set')
//       await takeAction('removeALL')
//     } catch {
//       more = false
//     }
//   }
// }

// // loop()
module.exports = { takeAction }
