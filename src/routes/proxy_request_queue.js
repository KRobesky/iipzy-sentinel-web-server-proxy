const WaitQueue = require('wait-queue');
//const Defs = require("iipzy-shared/src/defs");

//const { request } = require("express");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");
const { parse } = require('uuid');

let queueReq = new WaitQueue();
let count = 0;
let queueRes = new WaitQueue();

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

function parseRes(res) {
  try {
    for (const [key] of Object.entries(res)) {
      log("key = " + key);
    }
  } catch (ex) {
    log("(Exception) parseRes: " + ex, "qu  ", "info");
  }
}

function enqueueReq(req, res) {
  try {
    //parseRes(req);
    log("enqueueReq[" + count + "]", "qu  ", "info");
    if (res) res.iipzy_id = count;
    //log("xenqueueReq[" + count + "]: res.ken_robesky_id: " + res.ken_robesky_id, "qu  ", "info");
    //parseRes(res);
    const data = {req, res, count};
    queueReq.push(data);
    count++;
  } catch (ex) {
    log("(Exception) enqueueReq: " + ex, "qu  ", "info");
  } 
}

async function dequeueReq() {
  try {
    log(">>>dequeueReq", "qu  ", "info");
    const data = await queueReq.shift();
    log("<<<dequeueReq[" + data.count + "]", "qu  ", "info");
    return data;
  } catch (ex) {
    log("(Exception) dequeueReq: " + ex, "qu  ", "info");
  }
}

function queueReqLength() {
  return queueReq.length;
}

module.exports = { enqueueReq, dequeueReq, parseReq, parseRes, queueReqLength};
