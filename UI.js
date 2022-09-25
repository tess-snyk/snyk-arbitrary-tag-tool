const inquirer = require('inquirer')
require('dotenv').config()
const request = require('superagent')
const fs = require('fs')
const main = require('./main')
const { defaultMaxListeners } = require('events')
const builder = require('./buildProjectsByOrg')

const projectsByOrgArrayJSON = require('./projectsByOrg.json')

projectsByOrgArr = projectsByOrgArrayJSON.projectsByOrgArray

function mainMenu() {
  //TODO implement change of code to use this pattern for when to exit the UI
  // while (true) {
  // prompt user input
  // if (useranswer .tolowercase() === 'exit') break
}
inquirer
  .prompt([
    {
      name: 'main_menu_choice',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View a list of my org IDs',
        'Build/rebuild project list',
        'View all projects',
        'Apply all tags',
        'Remove all tags',
        'View tagsArray',
        'Exit',
      ],
    },
  ])
  .then((answer) => {
    let exit = false
    switch (answer.main_menu_choice) {
      case 'View a list of my org IDs':
        console.log(main.uniqueOrgIds)
        break

      case 'Build/rebuild project list':
        builder.writeProjectsByOrgJSON(main.uniqueOrgIds)

        console.log("Project list built as 'projectsByOrg.json'")
        exit = true
        console.log('Exiting. Restart to continue')
        break

      case 'View tagsArray':
        console.log(main.tagsArray)
        break

      case 'Apply all tags':
        main.setAllTags(main.tagsArray)
        console.log('Tags applied')
        break

      case 'Remove all tags':
        main.removeAllTags(main.tagsArray)
        console.log('Tags removed')
        break

      case 'View all projects':
        console.log('all projects are here:')
        main.logAllProjectsByOrg(main.uniqueOrgIds)
        break

      default:
        console.log('exiting')
        exit = true
        break
    }

    if (exit === false) mainMenu()
  })

mainMenu()

// In progress: Notes towards simplifying the projects data:

// let newArr = []
// for (orgObj of projectsByOrgArr) {
//   newArr = orgObj.projects.map((proj, i) => ({
//     org_name: orgObj.org.name,
//     org_id: orgObj.org.id,
//     project_name: proj.name,
//     project_id: proj.id,
//     tags: proj.tags,
//   }))
// }

// console.log(newArr)
