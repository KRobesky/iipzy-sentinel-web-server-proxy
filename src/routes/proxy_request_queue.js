const WaitQueue = require('wait-queue');
//const Defs = require("iipzy-shared/src/defs");

//const { request } = require("express");
const { log } = require("iipzy-shared/src/utils/logFile");
//const { sleep } = require("iipzy-shared/src/utils/utils");

//let queueReq = new WaitQueue();
//let count = 0;

class Queue {
  constructor(title) {
    log("Queue.constructor: title = " + title + "qu  ", "info");
    this.title = title;

    this.queueReq = new WaitQueue();
    this.count = 0;

  }

  parseReq(req) {
    return {  path: req.path,
              originalUrl: req.originalUrl,
              baseUrl: req.baseUrl,
              method: req.method,
              host: req.host,
              protocol: req.protocol,
              body: req.body,
    };
  }

  parseRes(res) {
    try {
      for (const [key] of Object.entries(res)) {
        log("key = " + key);
      }
    } catch (ex) {
      log("(Exception) parseRes: " + ex, "qu  ", "info");
    }
  }

  enqueueReq(req, res) {
    try {
      //parseRes(req);
      log("Queue.enqueueReq(" + this.title + ")[" + this.count + "]", "qu  ", "info");
      if (res) res.iipzy_id = this.count;
      //log("xenqueueReq[" + count + "]: res.ken_robesky_id: " + res.ken_robesky_id, "qu  ", "info");
      //parseRes(res);
      const data = {req, res, count: this.count};
      this.queueReq.push(data);
      this.count++;
    } catch (ex) {
      log("(Exception) Queue.enqueueReq(" + this.title + "): " + ex, "qu  ", "info");
    } 
  }

  async dequeueReq() {
    try {
      log(">>>Queue.dequeueReq(" + this.title + ")", "qu  ", "info");
      const data = await this.queueReq.shift();
      log("<<<Queue.dequeueReq(" + this.title + ")[" + data.count + "]", "qu  ", "info");
      return data;
    } catch (ex) {
      log("(Exception) Queue.dequeueReq(" + this.title + "): " + ex, "qu  ", "info");
    }
  }

  queueReqLength() {
    return this.queueReq.length;
  }
}

module.exports = Queue;
