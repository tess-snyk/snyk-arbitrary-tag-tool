# snyk-arbitrary-tag-tool

## Sample Data

The sample data folder includes examples of the input files:

* projects-example.json is created by querying the snyk api for a list of projects in an org
* bitbucket-cloud-import-targets.json is created using the snyk api import tool

The sample data also includes the target output format:

* tag-array-example.json

The goal is to transform the inputs into the output

## Environment Set Up and Dependencies

**Dependencies**

NPM
node.js

dotenv: manages environment variables

```shell
npm install dotenv
```

**Environment Configuration**

Set enironment variables .env saved to the .gitignore file

* Clone this repository to a local directory:

```shell
git clone https://github.com/tess-snyk/snyk-arbitrary-tag-tool.git
```

