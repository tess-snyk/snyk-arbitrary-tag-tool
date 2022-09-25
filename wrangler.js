//GET SNYK DATA : "SnykData"

// This code assumes that projectsByOrg.json exists already. Run builder.js to create it.
const projectsByOrgArrayJSON = require('./projectsByOrg.json')
snykDataArr = projectsByOrgArrayJSON.projectsByOrgArray

function getRefinedSnykData(snykDataArr) {
  const getNameProjIDs = (projectsArr) => {
    return projectsArr.map((project) => ({
      name: project.name,
      projId: project.id,
    }))
  }

  const refineByOrg = (snykDataArr) => {
    return snykDataArr.map((orgObj) => ({
      orgName: orgObj.org.name,
      orgID: orgObj.org.id,
      projects: getNameProjIDs(orgObj.projects),
    }))
  }

  const flatten = (refinedSnykData) => {
    let flatArr = []
    for (const orgObj of refinedSnykData) {
      orgObj.projects.forEach((project) => {
        const projData = {
          projectName: project.name,
          projectID: project.projId,
          orgName: orgObj.orgName,
          orgID: orgObj.orgID,
        }
        flatArr.push(projData)
      })
    }
    return flatArr
  }

  return flatten(refineByOrg(snykDataArr))
}

let refinedSnykData = getRefinedSnykData(snykDataArr)

//GET PROJECT IDs AND TAG DATA from BitBucket : "BBData"

const targetsArrayJSON = require('./sample_data/bitbucket-cloud-import-targets.json')
BBDataArr = targetsArrayJSON.targets

function getRefinedBBData(BBDataArr) {
  return BBDataArr.map((target) => ({
    name: target.target.name,
    orgID: target.orgId,
  }))
}

let refinedBBData = getRefinedBBData(BBDataArr)

// BUILD TAGS ARRAY

function buildTagsArray(refinedBBData, refinedSnykData) {
  let tagsArray = []
  for (let snykObj of refinedSnykData) {
    let BBmatch = refinedBBData.find(
      (BBobj) =>
        BBobj.orgID === snykObj.orgID &&
        snykObj.projectName.includes(BBobj.name)
    )
    let tagObj = { ...snykObj, tagName: BBmatch.name }
    tagsArray.push(tagObj)
  }
  return tagsArray
}

const tagsArray = buildTagsArray(refinedBBData, refinedSnykData)

function countProjects(snykDataArr) {
  return snykDataArr.reduce((acc, val) => acc + val.projects.length, 0)
}

const projectCount = countProjects(snykDataArr)

module.exports = { tagsArray, projectCount }
