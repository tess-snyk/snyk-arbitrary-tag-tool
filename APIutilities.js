function getUniqueStatusCodes(actionResults) {
  let allCodes = actionResults.map((responseObj) => responseObj.status)
  return Array.from(new Set(allCodes))
}

function getActionReport(uniqueStatusCodes, actionResults) {
  let report = []
  for (const code of uniqueStatusCodes) {
    const responseArr = actionResults.filter((responseSummary) => {
      return code === responseSummary.status
    })
    tagArraySubset = []
    for (projObj of responseArr) {
      tagArraySubset.push(projObj.tagObj)
    }

    const count = responseArr.length
    report.push({ status: code, count: count, responseArr, tagArraySubset })
  }

  const numSuccess = report.find((reportObj) => reportObj.status === 200).count
  console.dir(report, { depth: 1 })
  console.log(`${numSuccess} requests were successful`)
  console.log(`${actionResults.length - numSuccess} requests failed`)

  return report
}

module.exports = { getUniqueStatusCodes, getActionReport }
