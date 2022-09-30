require('dotenv').config()
const fs = require('fs')
const axios = require('axios')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
axios.defaults.headers.common['Content-Type'] = 'application/json'

const BBdataArrayJSON = require('./sample_data/test4.json')
const { get } = require('superagent')

BBDataArr = BBdataArrayJSON.targets

function getUniqueOrgIds(BBDataArr) {
  const allOrgIds = BBDataArr.map((target) => target.orgId)
  return Array.from(new Set(allOrgIds))
}

const getProjectByOrgID = async (orgID) => {
  try {
    const response = await axios.get(`${snykAPIurl}${orgID}/projects`)
    return response
  } catch (err) {
    return err.response
  }
}

const getAllProjectsByOrgId = async (orgIDArray) => {
  const promiseArray = []
  for (const orgID of orgIDArray) {
    const promise = getProjectByOrgID(orgID)
    promiseArray.push(promise)
  }

  const projectsByOrg = await Promise.all(promiseArray)
  console.log(projectsByOrg[0].data)
  return projectsByOrg
}

const uniqueOrgIds = getUniqueOrgIds(BBDataArr)

module.exports = {
  BBDataArr,
  uniqueOrgIds,
  getAllProjectsByOrgId,
}
