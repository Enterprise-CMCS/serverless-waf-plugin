"use strict";

import Serverless from "serverless";

export class WafPlugin {
  private serverless: Serverless;
  private hooks: any;

  constructor(serverless: Serverless) {
    this.serverless = serverless;
    this.hooks = {
      "before:package:finalize": () => this.updateStack(),
      "after:package:finalize": () => console.log("WAF Deployed"),
    };
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
      this.serverless.service.custom?.wafExcludeRules?.awsCommon ?? [];

    const awsIpReputationExcludeRules: string[] =
      this.serverless.service.custom?.wafExcludeRules?.awsIpReputation ?? [];

    const awsBadInputsExcludeRules: string[] =
      this.serverless.service.custom?.wafExcludeRules?.awsBadInputs ?? [];

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

    console.log("Deploying WAF");
  }
}

module.exports = WafPlugin;
