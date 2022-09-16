require('dotenv').config()
const request = require('superagent')
const fs = require('fs')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

const targetsArrayJSON = require('./sample_data/bitbucket-cloud-import-targets.json')

targetsArr = targetsArrayJSON.targets

function getUniqueOrgIds(targetsArr) {
  const allOrgIds = targetsArr.map((target) => target.orgId)
  return Array.from(new Set(allOrgIds))
}

const uniqueOrgIds = getUniqueOrgIds(targetsArr)

function writeProjectsByOrgJSON(uniqueOrgIds) {
  const arrayOfPromises = uniqueOrgIds.map((orgID) => {
    return request
      .get(`${snykAPIurl}${orgID}/projects`)
      .set({
        Authorization: AUTH_TOKEN,
        'Content-Type': 'application/json',
      })
      .then((response) => response.body)
  })

  return Promise.allSettled(arrayOfPromises).then((result) => {
    const projectsByOrg = result.map((el) => ({
      org: el.value.org,
      projects: el.value.projects,
    }))

    const projectsByOrgObj = { projectsByOrgArray: projectsByOrg }
    try {
      fs.writeFileSync('projectsByOrg.json', JSON.stringify(projectsByOrgObj))
    } catch (err) {
      console.error(err)
    }
    return projectsByOrgObj
  })
}

// writeProjectsByOrgJSON(uniqueOrgIds)

module.exports = { writeProjectsByOrgJSON }
