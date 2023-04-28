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

const { dequeueReq, parseReq, parseRes } = require("./proxy_request_queue");

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
router.post("/", async (req, res) => {
  log(">>> POST from sentinel", "prxy", "info");
  log("POST proxy_req[" + req.body.count + "] rsp from sentinel: " + JSON.stringify(req.body.data, null, 2), "prxy", "info");

  try {
    // "request" to client proxy
    //?? TODO timeout.
    const qdata = await dequeueReq();
    log("POST proxy_req[" + qdata.count + "] req to sentinel: " + JSON.stringify(parseReq(qdata.req)), "prxy", "info");
    await res.send({method: qdata.req.method, originalUrl: qdata.req.originalUrl, body: qdata.req.body, headers: getCustomHeaders(qdata.req), count: qdata.count});

    // TODO finish server side request.
     // response to browser
    //await qdata.res.send(JSON.stringify(req.body.data));
    if (prev_qdata !== null) {
      log("POST proxy_req[" + prev_qdata.count + "] iipzy_id = " + prev_qdata.res.iipzy_id, "prxy", "info" );
      const body_data = JSON.stringify(req.body.data);
      log("POST proxy_req[" + prev_qdata.count + "] res to web = " + body_data, "prxy", "info" );
      log("POST proxy_req[" + prev_qdata.count + "] prev url = " + prev_qdata.res.req.originalUrl, "prxy", "info" );
      //parseRes(prev_qdata.res);
      await prev_qdata.res.send(req.body.data);
      //await qdata.res.send(body_data);
    }
      //enqueueRes(prev_qdata, JSON.stringify(req.body.data));
    prev_qdata = qdata;
  } catch (ex) {
     log("(Exception) POST proxy_req:" + ex, "prxy", "error");
  }
  log("<<< POST from sentinel", "prxy", "info");
});

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