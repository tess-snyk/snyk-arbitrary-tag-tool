require('dotenv').config()
const request = require('superagent')
const fs = require('fs')

const snykAPIurl = 'https://api.snyk.io/api/v1/org/'
const ORG_ID = process.env.ORG_ID
const AUTH_TOKEN = process.env.TOKEN

const targetsArrayJSON = require('./sample_data/bitbucket-cloud-import-targets.json')
const projectsObjJSON = require('./sample_data/projects-example.json')

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

//These lines simple remove the outer brackets from the JSON data, returning
//arrays
projectsArr = projectsObjJSON.projects
targetsArr = targetsArrayJSON.targets

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

const simpleTargetsArr = simplifyTargetsArr(targetsArr)
const simpleProjectsArr = simplifyProjectsArr(projectsArr)

//The combineTargetProjects combines the data we need from the two sources into
//a structure that the setAllTags function can use
function combineTargetsProjects(targetsArr, projectsArr) {
  let tagsArray = []
  for (targetEl of targetsArr) {
    const matchingProjects = projectsArr.filter((projEl) =>
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

const tagsArray = combineTargetsProjects(simpleTargetsArr, simpleProjectsArr)

console.log(tagsArray)
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
  for (tagObj of tagsArray) {
    console.log(tagObj)
    setTag(tagObj)
  }
}

function removeAllTags(tagsArray) {
  for (tagObj of tagsArray) {
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

function logAllProjects() {
  return request
    .get(`${snykAPIurl}${ORG_ID}/projects`)
    .set({
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json',
    })
    .then((response) => console.log(response.body))
}

// console.log(tagsArray)
// setAllTags(tagsArray)
// logAllProjects()
// removeAllTags(tagsArray)
// removeTag(oneTagObj)
// writeProjectsData() logOneProject(oneTagObj) setAllTags(shortTagsArray)
