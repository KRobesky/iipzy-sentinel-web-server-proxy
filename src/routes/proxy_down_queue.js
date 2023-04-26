//const Defs = require("iipzy-shared/src/defs");

const { request } = require("express");
const { log } = require("iipzy-shared/src/utils/logFile");

let queue = [];

function parseReq(req) {
  return { path: req.path,
           method: req.method,
           host: req.host,
           protocol: req.protocol,
           body: req.body,
  };
}

function enqueue(key, req, res) {
  try {
    log("enqueue: key: " + key + ", req: " + JSON.stringify(parseReq(req)), "qu  ", "info");
    log("enqueue: res: " + res, "qu  ", "info");
    const data = {key, req, res};
    //queue.push({key, req, res});
    queue.push(data);
  } catch (ex) {
    log("(Exception) enqueue: " + ex, "qu  ", "info");
  } 
}

async function dequeue() {
  try {
    log("dequeue", "qu  ", "info");
    while (true) {
      if (queue.length > 0) {
        const data = queue[0];
        queue.splice(0);
        return data;
      }
      await sleep(100);
    }
  } catch (ex) {
    log("(Exception) dequeue: " + ex, "qu  ", "info");
  }
}

module.exports = { enqueue, dequeue };
