const WaitQueue = require('wait-queue');
//const Defs = require("iipzy-shared/src/defs");

//const { request } = require("express");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

let queue = new WaitQueue();

function parseReq(req) {
  return {  path: req.path,
            originalUrl: req.originalUrl,
            baseUrl: req.baseUrl,
            method: req.method,
            host: req.host,
            protocol: req.protocol,
            body: req.body,
  };
}

function enqueue(req, res) {
  try {
    log("enqueue: req: " + JSON.stringify(parseReq(req)), "qu  ", "info");
    log("enqueue: res: " + res, "qu  ", "info");
    const data = {req, res};
    queue.push(data);
  } catch (ex) {
    log("(Exception) enqueue: " + ex, "qu  ", "info");
  } 
}

async function dequeue() {
  try {
    log("dequeue", "qu  ", "info");
    const data = await wq.shift();
    return data;
    /*
    while (true) {
      if (queue.length > 0) {
        const data = queue[0];
        queue.splice(0);
        return data;
      }
      await sleep(100);
    }
    */
  } catch (ex) {
    log("(Exception) dequeue: " + ex, "qu  ", "info");
  }
}

module.exports = { enqueue, dequeue };
