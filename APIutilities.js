const inquirer = require('inquirer')

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

  // const handlefailures = async (report) => {
  //   for (const group of report) {
  //     console.log('group.status', group.status)
  //     if (String(group.status).startsWith('2')) {
  //       console.log('This group looks good')
  //     } else if (group.status === 500) {
  //       console.log('hi')
  //     }
  //     //TODO: Automatically retry when there is a 500 http error, and/or give option to try again
  //     //TODO: Give option to try again when there is a 429 (rate limiting error), but only after a timeout
  //     //TODO: For all other errors, give opportunity to see the errors and either try again OR
  //     // to REVERSE the actions that have already been taken and return to normal (I guess the problem
  //     // with that is - well -what if THOSE actions also have errors?
  //     // The plan was to use the tagArraySubset as an indication for what hasn't been completed
  //   }
  //   const answer = await inquirer.prompt([
  //     {
  //       name: 'options',
  //       type: 'list',
  //       message: 'What would you like to do?',
  //       choices: ['1', '2', '3', '4'],
  //     },
  //   ])

  //   switch (answer.options) {
  //     case '1':
  //       console.log(1)
  //       break

  //     case '2':
  //       console.log('2')
  //       break

  //     case '3':
  //       console.log('3')
  //       break

  //     case '4':
  //       console.log('4')
  //       break

  //     default:
  //       console.log('exiting')
  //       break
  //   }
  // }
  console.dir(report, { depth: 1 })
  // handlefailures(report)

  return report
}

// Get unique status codes
// Create an object that contains the data from these codes
// Create a function that can build a tag array from those codes
// Include in the take action function a yes/no opportunity to
// do the process again on the tag array for the ones that didn't work (500 status errors)
// Include code in the take action function that reports on what happened by status code

module.exports = { getUniqueStatusCodes, getActionReport }
