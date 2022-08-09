"use strict";

class WafPlugin {
  constructor(serverless) {
    this.serverless = serverless;
    this.hooks = {
      initialize: () => this.init(),
      "after:deploy:deploy": () => this.generateWafResource(),
      "before:package:finalize": () => this.updateStack(),
    };
  }

  init() {
    this.serverless.service.custom.testValue = "hello world";
    console.log("serverless instance: ", this.serverless);
    // this.generateWafResource();
  }

  generateWafResource() {
    console.log("is this getting called");
    // this.serverless.service.resources.Resources.APIGwWebAcl = {
    //   Type: "AWS::WAFv2::WebACL",
    //   Properties: {
    //     Name: this.serverless.service.custom.webAclName + "hellothere",
    //     DefaultAction: {
    //       Block: {},
    //     },
    //   },
    // };

    // console.log(
    //   "serverless instance resources: ",
    //   this.serverless.service.resources
    // );
    // console.log(
    //   "serverless instance resources properties: ",
    //   this.serverless.service.resources.Resources.APIGwWebAcl.Properties
    // );
  }

  updateStack() {
    console.log(
      "this is where the cloudformation stack will be updated for aws waf",
      this.serverless.service.resources.Resources.APIGwWebAcl
    );
    this.serverless.service.provider.compiledCloudFormationTemplate.Resources.APIGwWebAclTest =
      {
        Type: "AWS::WAFv2::WebACL",
        Properties: {
          Name: this.serverless.service.custom.webAclName + "hellothere",
          DefaultAction: {
            Block: {},
          },
          VisibilityConfig: {
            SampledRequestsEnabled: true,
            CloudWatchMetricsEnabled: true,
            MetricName: "testmetric",
          },
          Scope: "REGIONAL",
        },
      };
  }
}

module.exports = WafPlugin;
