# @enterprise-cmcs/serverless-waf-plugin

## This is a serverless plugin which has an intelligent set of rules for a waf.

### Getting Started

To install the required plugins run the following commands:

```
npm i -D @enterprise-cmcs/serverless-waf-plugin
npm i -D serverless-associate-waf
```

### Notes

This plugin is meant to be used in conjunction with another plugin called [serverless-associate-waf](https://github.com/mikesouza/serverless-associate-waf)

This plugin simply creates the waf and the above plugin will associate the waf with the desired resource.

### Example usage

There are a few configuration options that can be set in the serverless.yml but if you do not need to customize the waf rules at all then simply including the plugin will suffice. The naming convention used for the waf that this plugin generates is the following.

```
[stage-name]-[service-name]-webacl
```

This is important to note as you will be using this name in the associate waf plugin to associate the resource. Below is an example of what a serverless.yml file will look like (the peices that need configured).

```
plugins:
  - "@enterprise-cmcs/serverless-waf-plugin"
  - serverless-associate-waf

custom:
  stage: ${opt:stage, self:provider.stage}
  webAclName: ${self:custom.stage}-${self:service}--webacl
  associateWaf:
    name: ${self:custom.webAclName}
    version: V2

```

There are also currently three customizable rules that can be used by the waf plugin. They are the following:

- awsCommon
- awsIpReputation
- awsBadInputs

Below is an example of how you would set an exclude rule in the serverless.yml file:

```
custom:
    wafExcludeRules:
        awsCommon:
            - "SizeRestrictions_BODY"
```
