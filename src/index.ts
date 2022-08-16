"use strict";

import Serverless from "serverless";

export class WafPlugin {
  private serverless: Serverless;
  private hooks: any;

  constructor(serverless: Serverless) {
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
    const generateExcludeRuleList = (rules: string[]) => {
      return rules.map((ruleToExclude) => ({
        Name: ruleToExclude,
      }));
    };
    // set the waf name based on stage and service name ${self:service}-${self:custom.stage}-webacl
    const wafName = `${
      this.serverless.service.custom.stage
    }-${this.serverless.service.getServiceName()}-webacl`;

    const awsCommonExcludeRules: string[] =
      this.serverless.service.custom?.awsCommonExcludeRules ?? [];

    const awsIpReputationExcludeRules: string[] =
      this.serverless.service.custom?.awsIpReputationExcludeRules ?? [];
    this.serverless.service.custom?.ddosRateLimitRules ?? [];

    const awsBadInputsExcludeRules: string[] =
      this.serverless.service.custom?.awsBadInputsExcludeRules ?? [];

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
                    ...generateExcludeRuleList(awsCommonExcludeRules),
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
                  ExcludedRules: [
                    ...generateExcludeRuleList(awsIpReputationExcludeRules),
                  ],
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
                  ExcludedRules: [
                    ...generateExcludeRuleList(awsBadInputsExcludeRules),
                  ],
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
