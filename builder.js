require('dotenv').config()
const fs = require('fs')
const axios = require('axios')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.common['Content-Type'] = 'application/json'

const targetsArrayJSON = require('./sample_data/bitbucket-cloud-import-targets-OLD.json')

targetsArr = targetsArrayJSON.targets

function getUniqueOrgIds(targetsArr) {
  const allOrgIds = targetsArr.map((target) => target.orgId)
  return Array.from(new Set(allOrgIds))
}
const uniqueOrgIds = getUniqueOrgIds(targetsArr)
console.log(uniqueOrgIds)

function writeProjectsByOrgJSON(orgIDArray) {
  const getProjectByOrgID = async (orgID) => {
    try {
      const response = await axios.get(`${snykAPIurl}${orgID}/projects`)
      // console.log(response)
      return response.data
    } catch (err) {
      console.log('err')
    }
  }

  const getAllProjectsByOrgId = async (orgIDArray) => {
    const promiseArray = []
    for (const orgID of orgIDArray) {
      console.log(orgID)
      const promise = getProjectByOrgID(orgID)
      promiseArray.push(promise)
    }

    const projectsByOrg = await Promise.all(promiseArray)

    return { projectsByOrgArray: projectsByOrg }
  }

  const writeToJSON = async (orgIDArray) => {
    const projectsByOrgObj = await getAllProjectsByOrgId(orgIDArray)

    try {
      fs.writeFileSync('projectsByOrg.json', JSON.stringify(projectsByOrgObj))
    } catch (err) {
      console.error(err)
    }
    return projectsByOrgObj
  }
  writeToJSON(orgIDArray)
}

writeProjectsByOrgJSON(uniqueOrgIds)
