const express = require("express");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");
//const { createConnectionUuid, getConnectionUuid } = require("../ipc/connection");
//const { eventWaiter } = require("../ipc/eventWaiter");
//const { sendDelayedResults } = require("../utils/sendDelayedResults");
//const { isValidConnection } = require("./validateConnection");

const { dequeueReq, enqueueReq, enqueueRes, parseReq, parseRes, queueReqLength } = require("./proxy_request_queue");

watchReqQueue();

router.get("/", async (req, res) => {
  log("GET proxy_req: timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info");

  setTimeout(() => {
    return res.send({
      event: Defs.ipcConnectionToken,
      data: { connToken: 'biteme' }
    });
  }, 5 * 1000);
});

// from client proxy - request to client are sent in response to post.  
//  Post body contains response to previous request to client.
let prev_qdata = null;
let latest_req_ts = Date.now();
let assemble_body = "";
router.post("/", async (req, res) => {
  log(">>> POST from sentinel", "prxy", "info");
  try {
    assemble_body += JSON.parse(req.body.chunk);
    if (!req.body.last_chunk) {
      res.send({});
      log("<<< POST from sentinel - chunking", "prxy", "info");
      return;
    }
    const req_body = JSON.parse(assemble_body);
    assemble_body = "";
    log("POST proxy_req[" + req_body.count + "] rsp from sentinel: " + JSON.stringify(req_body.data, null, 2), "prxy", "info");
    latest_req_ts = Date.now();

    if (prev_qdata !== null && prev_qdata.res) {
      // response to browser
      log("POST proxy_req[" + prev_qdata.count + "] iipzy_id = " + prev_qdata.res.iipzy_id, "prxy", "info" );
      log("POST proxy_req[" + prev_qdata.count + "] originalUrl = " + prev_qdata.req.originalUrl, "prxy", "info" );
      log("POST proxy_req[" + prev_qdata.count + "] res to web = " + JSON.stringify(req_body.data), "prxy", "info" );
      prev_qdata.res.send(req_body.data);
      prev_qdata = null;
    }

    const qdata = await dequeueReq();
    if (qdata.req) {
      log("POST proxy_req[" + qdata.count + "] req to sentinel: " + JSON.stringify(parseReq(qdata.req)), "prxy", "info");
      res.send({method: qdata.req.method, originalUrl: qdata.req.originalUrl, body: qdata.req.body, headers: getCustomHeaders(qdata.req), count: qdata.count});
      prev_qdata = qdata;
    } else {
      // dummy request because of idleness
      log("POST proxy_req[" + qdata.count + "] dummy req to sentinel", "prxy", "info");
      res.send({method: "NOOP", originalUrl: "", headers: [], count: qdata.count});
    }
  } catch (ex) {
     log("(Exception) POST proxy_req:" + ex, "prxy", "error");
  }
  log("<<< POST from sentinel", "prxy", "info");
});

async function watchReqQueue() {
  setInterval(() => {
    cur_ts = Date.now();
    if (queueReqLength() === 0 && ((cur_ts - latest_req_ts) > (20*1000))) {
      //log("watchReqQueue: force a dummy request", "prxy", "error");
      enqueueReq(null, null);
    }
  }, 1000);
}

function getCustomHeaders(req) {
  const headers = req.headers;
  const hobj = {headers};
  const customHeaders = [];
  //log("getCustomHeaders: " + JSON.stringify(hobj, null, 2), "prxy", "info");
  for (const [key, value] of Object.entries(hobj.headers)) {
    if (key.startsWith("x-")) {
      //log(`${key}: ${value}`);
      customHeaders.push({key, value});
    }
  }
  return customHeaders;
}

module.exports = router;
