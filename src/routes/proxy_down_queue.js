const WaitQueue = require('wait-queue');
//const Defs = require("iipzy-shared/src/defs");

//const { request } = require("express");
const { log } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

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

function enqueueReq(req, res) {
  try {
    log("enqueueReq[" + count + "]: req: " + JSON.stringify(parseReq(req)), "qu  ", "info");
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

function enqueueRes(qdata, body) {
  try {
    log("enqueueRes[" + qdata.count + "]", "qu  ", "info");
    const data = {qdata, body};
    queueRes.push(data);
   } catch (ex) {
    log("(Exception) enqueueRes: " + ex, "qu  ", "info");
  } 
}

async function dequeueRes() {
  try {
    log(">>>dequeueRes", "qu  ", "info");
    const data = await queueRes.shift();
    log("<<<dequeueRes[" + data.qdata.count + "]", "qu  ", "info");
    return data;
  } catch (ex) {
    log("(Exception) dequeueRes: " + ex, "qu  ", "info");
  }
}

module.exports = { enqueueReq, dequeueReq, enqueueRes, dequeueRes, parseReq};
