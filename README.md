# snyk-arbitrary-tag-tool

## Environment Set Up and Dependencies

**Dependencies**

NPM
node.js

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
echo "API=<your-api-key>">>.env
touch .gitignore
echo ".env">>.gitignore
```

## Input Data

The primary input data is generated as output from the "mirror project" workflow on the Snyk API Import tool: https://github.com/gwnlng/snyk-api-import

* bitbucket-cloud-import-targets.json is created using the snyk api import tool

The sample_data directory includes a file named bitbucket-cloud-import-targets.json You must replace this file with your output file of the same name.