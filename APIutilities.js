function getUniqueStatusCodes(actionResults) {
  let allCodes = actionResults.map((responseObj) => responseObj.status)
  return Array.from(new Set(allCodes))
}

function getActionReport(uniqueStatusCodes, actionResults) {
  let report = []
  for (const code of uniqueStatusCodes) {
    const responseArr = actionResults.filter((response) => {
      return code === response.status
    })
    const count = responseArr.length
    report.push({ status: code, count: count, responseArr })
  }
  return report
}

// Get unique status codes
// Create an object that contains the data from these codes
// Create a function that can build a tag array from those codes
// Include in the take action function a yes/no opportunity to
// do the process again on the tag array for the ones that didn't work (500 status errors)
// Include code in the take action function that reports on what happened by status code

module.exports = { getUniqueStatusCodes, getActionReport }
