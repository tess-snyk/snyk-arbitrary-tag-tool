# snyk-arbitrary-tag-tool

## Sample Data

The sample data folder includes examples of the input files:

* projects-example.json is created by querying the snyk api for a list of projects in an org
* targets-example.json is created using the snyk api import tool

The sample data also includes the target output format:

* tag-array-example.json

The goal is to transform the inputs into the output

## Data Transformation

**Transform targets**

targets-example.json is the output of running the API import tool. The below jq query transforms this data into a list of the tag names to be applied listed with their corresponding org.

Extract org ID and Target name (tag) from targets-example.json

```shell
jq '.targets | map(.) | .[] | {name: .target.name, orgId}' targets-example.json
```
