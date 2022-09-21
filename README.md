# snyk-arbitrary-tag-tool

## Use Case

This tool is designed to tag any Snyk Project related to a specific application service with a common tag.

"As a Tech Lead I want to apply the tag 'Service 1' to all Snyk Projects that are related to that service. The tag should be applied regardless of the Target (SCM, CI, CR) and regardless of the project type (code, open source, container or IaC"

This version of the tool makes the assumption that all projects related to a given application contain an identifying string in "Project Name" that is equal to the SCM repository name.

The tool performs the following:

1. Identify a list of unique applications by the list of repositories scanned using the API Import tool and the Snyk Organisations that scans were sent to. Transform this to a list of tags related to each Organisation
2. List all projects in the Organisations that have received any new projects in the API Import, extracting Project Name, Project ID, and Org ID
3. Iterate through a search for a string matching each tag name in each project and where there is a match, apply the tag using the Snyk API

See "Limitations"

## Environment Set Up and Dependencies

**Dependencies**

NPM
node.js

Developed and tested with: node v18.9.0, npm 8.19.1

**Environment Configuration**

Set enironment variables .env saved to the .gitignore file. Note, if you choose to manage your API key another way you will still need to create the .env file and add it to .gitignore for this script to run.

* Clone this repository to a local directory:

```shell
git clone https://github.com/tess-snyk/snyk-arbitrary-tag-tool.git
```
* Change into the snyk-arbitary-tag-tool directory, create the environment file and add your API key then add the environment file to your .gitignore file

```shell
cd snyk-arbitrary-tag-tool
touch .env
echo "TOKEN=<your-api-key>">>.env
touch .gitignore
echo ".env">>.gitignore
```

## Input Data

The primary input data is generated as output from the "mirror project" workflow on the Snyk API Import tool: https://github.com/gwnlng/snyk-api-import

* bitbucket-cloud-import-targets.json is created using the snyk api import tool

The sample_data directory includes a file named bitbucket-cloud-import-targets.json You must replace this file with your output file from the API-Import tool keeping the same name.

## Run in Demo Mode

1. Create a list of projects to tag:

* Remove projectsByOrg.json if it is in the repo by deleting it. Create Projects list data by running buildProjectsByOrg.js

```
node buildProjectsByOrg.js
```

Demo mode requires updating the main.js file to remove comments in the following order

```
//Step 1: Check tags and then apply tags
//Remove comments from the following two lines:

//logAllProjectsByOrg(uniqueOrgIds)
//setAllTags(tagsArray)

//Step 2: Confirm tags were applied
//Remove comments from the following line:
//logAllProjectsByOrg(uniqueOrgIds)

//Step 3: Remove tags
//Remove comments from the following line:
// removeAllTags(tagsArray)
```

```
node main.js
```

## Run with CLI tool

Work in progress as of 16 Sept 2022

## Limitations

* Snyk API rate limit 2000 / minute
* Developed and tested in node v18.9.0, npm 8.19.1
* Total unique key:value tags per Group = 1000
* Dependent on finding an exact match of the intended tag within project name
* Initially dataset based on recently uploaded projects (to be updated for ongoing operations)
* Run in demo mode only until this page is updated
* Work to do for Production Operations Readiness:
    * buildProjectsByOrg.js over-writes any existing projectsByOrg.json file so there is no manual removal required
    * 