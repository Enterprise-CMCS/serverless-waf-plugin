"use strict";

import Serverless from "serverless";

export class WafPlugin {
  private serverless: Serverless;
  private hooks: any;
  constructor(serverless: any) {
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
  }

  updateStack() {
    // set the waf name based on stage and service name ${self:service}-${self:custom.stage}-webacl
    const wafName = this.serverless.service.custom.wafName;
    console.log("waf name: ", wafName);

    this.serverless.service.provider.compiledCloudFormationTemplate.Resources.APIGwWebAclTest =
      {
        Type: "AWS::WAFv2::WebACL",
        Properties: {
          Name: wafName,
          DefaultAction: {
            Block: {},
          },
          VisibilityConfig: {
            CloudWatchMetricsEnabled: true,
            SampledRequestsEnabled: true,
            MetricName: `${wafName}-webacl`,
          },
          Rules: [
            {
              Name: `${wafName}-DDOSRateLimitRule`,
              Priority: 0,
              Action: {
                Block: {},
              },
              Statement: {
                RateBasedStatement: {
                  Limit: 5000,
                  AggregateKeyType: "IP",
                },
              },
              VisibilityConfig: {
                SampledRequestsEnabled: true,
                CloudWatchMetricsEnabled: true,
                MetricName: `${wafName}-DDOSRateLimitRuleMetric`,
              },
            },
            {
              Name: `${wafName}-AWSCommonRule`,
              Priority: 1,
              OverrideAction: {
                None: {},
              },
              Statement: {
                ManagedRuleGroupStatement: {
                  VendorName: "AWS",
                  Name: "AWSManagedRulesCommonRuleSet",
                  ExcludedRules: [
                    {
                      Name: "SizeRestrictions_BODY",
                    },
                  ],
                },
              },
              VisibilityConfig: {
                SampledRequestsEnabled: true,
                CloudWatchMetricsEnabled: true,
                MetricName: `${wafName}-AWSCommonRuleMetric`,
              },
            },
            {
              Name: `${wafName}-AWSManagedRulesAmazonIpReputationList`,
              Priority: 2,
              OverrideAction: {
                None: {},
              },
              Statement: {
                ManagedRuleGroupStatement: {
                  VendorName: "AWS",
                  Name: "AWSManagedRulesAmazonIpReputationList",
                },
              },
              VisibilityConfig: {
                SampledRequestsEnabled: true,
                CloudWatchMetricsEnabled: true,
                MetricName: `${wafName}-AWSManagedRulesAmazonIpReputationListMetric`,
              },
            },
            {
              Name: `${wafName}-AWSManagedRulesKnownBadInputsRuleSet`,
              Priority: 3,
              OverrideAction: {
                None: {},
              },
              Statement: {
                ManagedRuleGroupStatement: {
                  VendorName: "AWS",
                  Name: "AWSManagedRulesKnownBadInputsRuleSet",
                },
              },
              VisibilityConfig: {
                SampledRequestsEnabled: true,
                CloudWatchMetricsEnabled: true,
                MetricName: `${wafName}-AWSManagedRulesKnownBadInputsRuleSetMetric`,
              },
            },
            {
              Name: `${wafName}-allow-usa-plus-territories`,
              Priority: 5,
              Action: {
                Allow: {},
              },
              Statement: {
                GeoMatchStatement: {
                  CountryCodes: ["GU", "PR", "US", "UM", "VI", "MP"],
                },
              },
              VisibilityConfig: {
                SampledRequestsEnabled: true,
                CloudWatchMetricsEnabled: true,
                MetricName: `${wafName}-allow-usa-plus-territories-metric`,
              },
            },
          ],
          Scope: "REGIONAL",
        },
      };
  }
}

module.exports = WafPlugin;
