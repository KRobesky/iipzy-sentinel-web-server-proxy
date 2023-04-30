const express = require("express");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

const Queue = require("./proxy_request_queue");
const { getClientTokens, getState, setState } = require("./proxy_client");

//const { createConnectionUuid, getConnectionUuid } = require("../ipc/connection");
//const { eventWaiter } = require("../ipc/eventWaiter");
//const { sendDelayedResults } = require("../utils/sendDelayedResults");
//const { isValidConnection } = require("./validateConnection");

//const { dequeueReq, enqueueReq, enqueueRes, parseReq, parseRes, queueReqLength } = require("./proxy_request_queue");

watchReqQueue();

// from client proxy - request to client are sent in response to post.  
//  Post body contains response to previous request to client.
/*
let queue = null;
let prev_qdata = null;
let latest_req_ts = Date.now();
let assemble_body = "";
*/
router.post("/", async (req, res) => {
  log(">>> POST from sentinel", "prxy", "info");
  try {
    const clientToken = req.header("x-client-token");
    let state = getState(clientToken);
    let client_state = state ? state.client_state : null;
    if (!client_state || req.body.first_time) {
      client_state = {};
      client_state.clientToken = clientToken;
      client_state.prev_qdata = null;
      client_state.latest_req_ts = Date.now();
      client_state.assemble_body = "";
      client_state.queue = new Queue(clientToken);
      setState(clientToken, client_state, client_state.queue);
    }
    log("POST client-token = " + clientToken, "prxy", "info");
    log("chunk=" + req.body.chunk);
    client_state.assemble_body += req.body.chunk;
    if (!req.body.last_chunk) {
      res.send({});
      log("<<< POST from sentinel - chunking", "prxy", "info");
      return;
    }
    //log("assemble_body=\"" + assemble_body + "\"");
    const req_body = JSON.parse(client_state.assemble_body);
    client_state.assemble_body = "";
    log("POST proxy_req[" + req_body.count + "] rsp from sentinel: " + JSON.stringify(req_body.data, null, 2), "prxy", "info");
    client_state.latest_req_ts = Date.now();

    if (client_state.prev_qdata !== null && client_state.prev_qdata.res) {
      // response to browser
      log("POST proxy_req[" + client_state.prev_qdata.count + "] iipzy_id = " + client_state.prev_qdata.res.iipzy_id, "prxy", "info" );
      log("POST proxy_req[" + client_state.prev_qdata.count + "] originalUrl = " + client_state.prev_qdata.req.originalUrl, "prxy", "info" );
      log("POST proxy_req[" + client_state.prev_qdata.count + "] res to web = " + JSON.stringify(req_body.data), "prxy", "info" );
      client_state.prev_qdata.res.send(req_body.data);
      client_state.prev_qdata = null;
    }

    //?? problem.
    const qdata = await client_state.queue.dequeueReq();
    if (qdata.req) {
      log("POST proxy_req[" + qdata.count + "] req to sentinel: " + JSON.stringify(client_state.queue.parseReq(qdata.req)), "prxy", "info");
      res.send({method: qdata.req.method, originalUrl: qdata.req.originalUrl, body: qdata.req.body, headers: getCustomHeaders(qdata.req), count: qdata.count});
      client_state.prev_qdata = qdata;
    } else {
      // dummy request because of idleness
      log("POST proxy_req[" + qdata.count + "] dummy req to sentinel", "prxy", "info");
      res.send({method: "NOOP", originalUrl: "", headers: [], count: 0});
    }
  } catch (ex) {
    log("(Exception) POST proxy_req:" + ex, "prxy", "error");
    await sleep(5*1000);
    // dummy request because error.
    //?? TODO send delayed response.
    log("POST proxy_req[" + 0 + "] dummy req to sentinel", "prxy", "info");
    res.send({method: "NOOP", originalUrl: "", headers: [], count: 0});
  }
  log("<<< POST from sentinel", "prxy", "info");
});

async function watchReqQueue() {
  setInterval(() => {
    try {
      const clientTokens = getClientTokens();
      log("watchReqQueue: clientTokens = " + JSON.stringify(clientTokens), "prxy", "info");
      for (let i = 0; i < clientTokens.length; i++) {
        const { client_state } = getState(clientTokens[i]);
        //log("watchReqQueue: client_state.latest_req_ts = " + client_state.latest_req_ts, "prxy", "info");
        if (client_state.queue) {
          //log("watchReqQueue: MAYBE force a dummy request", "prxy", "error");
          cur_ts = Date.now();
          if (client_state.queue.queueReqLength() === 0 && ((cur_ts - client_state.latest_req_ts) > (20*1000))) {
            log("watchReqQueue: force a dummy request for clientToken " + client_state.clientToken, "prxy", "error");
            client_state.queue.enqueueReq(null, null);
          }
        }
      }
    } catch (ex) {
      log("(Exception) watchReqQueue: " + ex, "prxy", "info");
    }
  }, 5*1000);
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
