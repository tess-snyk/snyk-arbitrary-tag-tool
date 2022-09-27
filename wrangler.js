//GET SNYK DATA : "SnykData"

// This code assumes that projectsByOrg.json exists already. Run builder.js to create it.
const {
  BBDataArr,
  getAllProjectsByOrgId,
  uniqueOrgIds,
} = require('./builder.js')

function getRefinedSnykData(snykDataArr) {
  const getNameProjIDsTags = (projectsArr) => {
    return projectsArr.map((project) => {
      return {
        name: project.name,
        projId: project.id,
        currentTags: project.tags,
      }
    })
  }

  const refineByOrg = (snykDataArr) => {
    // console.log(snykDataArr)
    return snykDataArr.map((orgObj) => {
      // console.log(orgObj)
      return {
        orgName: orgObj.org.name,
        orgID: orgObj.org.id,
        projects: getNameProjIDsTags(orgObj.projects),
      }
    })
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
          currentTags: project.currentTags,
        }
        flatArr.push(projData)
      })
    }
    return flatArr
  }

  return flatten(refineByOrg(snykDataArr))
}

//GET PROJECT IDs AND TAG DATA from BitBucket : "BBData"

function getRefinedBBData(BBDataArr) {
  return BBDataArr.map((target) => ({
    name: target.target.name,
    orgID: target.orgId,
  }))
}

// BUILD TAGS ARRAY

function buildNewTagsArray(refinedBBData, refinedSnykData) {
  let newTagsArray = []
  for (let snykObj of refinedSnykData) {
    //Data is sorted to ensure that if there are multiple possible matches, the
    //longest tag name will be applied. Give two tag names "cat" and "catcher", the
    // project named "catcher-2022" will be applied the "catcher" tag and NOT
    // the "cat" tag. Only one service tag will be applied to each project.
    sortedRefinedBBData = refinedBBData.sort(
      (a, b) => b.name.length - a.name.length
    )
    let BBmatch = sortedRefinedBBData.find(
      (BBobj) =>
        BBobj.orgID === snykObj.orgID &&
        snykObj.projectName.includes(BBobj.name)
    )
    if (BBmatch === undefined) {
      console.log('No match found for the following object:')
      console.log('snykObj', snykObj)
      continue
    }
    let tagObj = { ...snykObj, tag: { key: 'service', value: BBmatch.name } }
    newTagsArray.push(tagObj)
  }
  return newTagsArray
}

function buildCurrentTagsArray(refinedSnykData) {
  let flatArr = []
  for (const project of refinedSnykData) {
    // console.log(project)
    project.currentTags.forEach((tag) => {
      const projData = {
        projectID: project.projectID,
        orgID: project.orgID,
        tag: tag,
      }
      flatArr.push(projData)
    })
  }
  return flatArr
}

async function buildTagArraysFromBBDataSnykAPI() {
  const snykDataArr = await getAllProjectsByOrgId(uniqueOrgIds)
  let refinedSnykData = getRefinedSnykData(snykDataArr)
  let refinedBBData = getRefinedBBData(BBDataArr)
  const newTagsArray = buildNewTagsArray(refinedBBData, refinedSnykData)
  const currentTagsArray = buildCurrentTagsArray(refinedSnykData)

  return (tagArrays = { newTagsArray, currentTagsArray })
}

let refinedBBData = getRefinedBBData(BBDataArr)
refinedBBData = refinedBBData.sort((a, b) => b.name.length - a.name.length)

console.log(refinedBBData)

module.exports = { buildTagArraysFromBBDataSnykAPI }
