# snyk-arbitrary-tag-tool

## Data Transformation

**Transform targets**

targets-example.json is the output of running the API import tool. The below jq query transforms this data into a list of the tag names to be applied listed with their corresponding org.

Extract org ID and Target name (tag) from targets-example.json

```shell
jq '.targets | map(.) | .[] | {name: .target.name, orgId}' targets-example.json
```
