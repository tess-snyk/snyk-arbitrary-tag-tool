const APIcaller = require('./APIcaller')

//TEST DATA
let xORGID = '99692bde-50ab-48e5-bb4a-2f093bac259e'
let xPROJECTID = '347e7466-4b27-4579-b988-84142f3d69d1'

let testObj = {
  orgID: xORGID,
  projectID: xPROJECTID,
  cat: 'pants',
  tagName: 'thingy-jig',
}

APIcaller.logOneProject(testObj).then((response) => console.log(response))
