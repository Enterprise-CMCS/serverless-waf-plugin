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
    //add comment
    console.log("hello world");
  }

  beforeDeploy() {
    // Before deploy
  }

  afterDeploy() {
    // After deploy
  }
}

module.exports = WafPlugin;
