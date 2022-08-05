"use strict";

class WafPlugin {
  constructor() {
    this.hooks = {
      initialize: () => this.init(),
      "before:deploy:deploy": () => this.beforeDeploy(),
      "after:deploy:deploy": () => this.afterDeploy(),
    };
  }

  init() {
    console.log("Serverless instance: ", this.serverless);

    // `serverless.service` contains the (resolved) serverless.yml config
    const service = this.serverless.service;
    console.log("Provider name: ", service.provider.name);
    console.log("Functions: ", service.functions);
  }

  beforeDeploy() {
    // Before deploy
  }

  afterDeploy() {
    // After deploy
  }
}

module.exports = WafPlugin;
