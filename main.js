require('dotenv').config()
const request = require('superagent')
const fs = require('fs')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

const targetsArrayJSON = require('./sample_data/bitbucket-cloud-import-targets.json')
const projectsObjJSON = require('./sample_data/projects-example.json')
const projectsByOrgArrayJSON = require('./projectsByOrg.json')

//These lines simply remove the outer curly brackets from the JSON data, returning
//arrays instead of objects
projectsArr = projectsObjJSON.projects
targetsArr = targetsArrayJSON.targets
projectsByOrgArr = projectsByOrgArrayJSON.projectsByOrgArray

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

writeProjectsByOrgJSON(uniqueOrgIds)

function getProjectsData() {
  return request
    .get(`${snykAPIurl}${ORG_ID}/projects`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .then((response) => {
      response.body
    })
}

//the writeProjectsData writes all projects data into a JSON file. This output
//should take the place of the projects-example.json file

function writeProjectsData() {
  return request
    .get(`${snykAPIurl}${ORG_ID}/projects`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .then((response) => {
      try {
        fs.writeFileSync('projects-example.json', JSON.stringify(response.body))
      } catch (err) {
        console.error(err)
      }
      return
    })
}

//Focusing in on the relevant targets data
function getNameAndOrgID(target) {
  const output = {
    name: target.target.name,
    orgId: target.orgId,
  }
  return output
}

function simplifyTargetsArr(targetsArr) {
  const output = targetsArr.map((target) => getNameAndOrgID(target))
  return output
}

//Focusing in on the relevant projects data

function getNameAndProjID(project) {
  const output = {
    name: project.name,
    project_id: project.id,
  }
  return output
}

function simplifyProjectsArr(projectsArr) {
  const output = projectsArr.map((project) => getNameAndProjID(project))
  return output
}

function simplifyProjectsByOrgArr(projectsByOrgArr) {
  const output = projectsByOrgArr.map((orgObj) => ({
    ...orgObj,
    projects: simplifyProjectsArr(orgObj.projects),
  }))
  return output
}

const simpleTargetsArr = simplifyTargetsArr(targetsArr)
const simpleProjectsArr = simplifyProjectsArr(projectsArr)
const simpleProjectsByOrgArr = simplifyProjectsByOrgArr(projectsByOrgArr)

//The combineTargetProjects combines the data we need from the two sources into
//a structure that the setAllTags function can use
// function combineTargetsProjects(targetsArr, projectsArr) {
//   let tagsArray = []
//   for (const targetEl of targetsArr) {
//     const matchingProjects = projectsArr.filter((projEl) =>
//       projEl.name.includes(targetEl.name)
//     )
//     //round brackets used around the map function body so JS doesn't get
//     //confused between a returned object and a function body
//     const partialTagsArray = matchingProjects.map((projEl) => ({
//       ...projEl,
//       org_id: targetEl.orgId,
//       tag: {
//         key: 'service',
//         value: targetEl.name,
//       },
//     }))
//     tagsArray.push(...partialTagsArray)
//   }
//   return tagsArray
// }

function combineTargetsProjects(simpleTargetsArr, simpleProjectsByOrgArr) {
  let tagsArray = []
  for (const targetEl of simpleTargetsArr) {
    const matchingOrgsProjObj = simpleProjectsByOrgArr.find(
      (el) => el.org.id === targetEl.orgId
    )
    const matchingOrgsProjArr = matchingOrgsProjObj.projects
    const matchingProjects = matchingOrgsProjArr.filter((projEl) =>
      projEl.name.includes(targetEl.name)
    )
    //round brackets used around the map function body so JS doesn't get
    //confused between a returned object and a function body
    const partialTagsArray = matchingProjects.map((projEl) => ({
      ...projEl,
      org_id: targetEl.orgId,
      tag: {
        key: 'service',
        value: targetEl.name,
      },
    }))
    tagsArray.push(...partialTagsArray)
  }
  return tagsArray
}

// function combineTargetProjectsByOrg()

const tagsArray = combineTargetsProjects(
  simpleTargetsArr,
  simpleProjectsByOrgArr
)

//Functions to enable setting tags through the API.

function setTag({ org_id, project_id, tag }) {
  return request
    .post(`${snykAPIurl}${org_id}/project/${project_id}/tags`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .send(tag)
    .then((response) => response.body)
}

function removeTag({ org_id, project_id, tag }) {
  return request
    .post(`${snykAPIurl}${org_id}/project/${project_id}/tags/remove`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .send(tag)
    .then((response) => response.body)
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

//logOneProject is a utility function used in development but no longer
//necessary. It takes a tag array element and logs the corresponding project
//details returned from the API
function logOneProject({ org_id, project_id, tag }) {
  return request
    .get(`${snykAPIurl}${org_id}/project/${project_id}`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .then((response) => console.log(response.body))
}

function logAllProjects(orgID) {
  return request
    .get(`${snykAPIurl}${orgID}/projects`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .then((response) => {
      console.log(`============== PROJECTS FOR ORG ID: ${orgID} ==============`)
      console.log(response.body)
    })
}

function logAllProjectsByOrg(uniqueOrgIds) {
  for (const orgID of uniqueOrgIds) {
    console.log(orgID)
    logAllProjects(orgID)
  }
}

//Step 1: Check tags and then apply tags
//Remove comments from the following two lines:

//logAllProjectsByOrg(uniqueOrgIds)
//setAllTags(tagsArray)

//Step 2: Confirm tags were applied
//Remove comments from the following line:
logAllProjectsByOrg(uniqueOrgIds)

//Step 3: Remove tags
//Remove comments from the following line:
//removeAllTags(tagsArray)

//List of available commands:
// console.log(tagsArray.length)
// console.log(projectsByOrgArr[0].projects.length)
//setAllTags(tagsArray)
// console.log(uniqueOrgIds)
// removeAllTags(tagsArray)
// removeTag(oneTagObj)
//writeProjectsData() logOneProject(oneTagObj) setAllTags(shortTagsArray)
