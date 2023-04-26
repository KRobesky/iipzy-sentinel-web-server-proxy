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

const { dequeue } = require("./proxy_down_queue");

router.get("/", async (req, res) => {
  log("GET proxy_down: timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info");

  setTimeout(() => {
    return res.send({
      event: Defs.ipcConnectionToken,
      data: { connToken: 'biteme' }
    });
  }, 5 * 1000);
});

router.post("/", async (req, res) => {
  log("POST proxy_down: timestamp = " + timestampToString(req.header("x-timestamp")) + ", body = " + JSON.stringify(req.body), "prxy", "info");
  /*
  setTimeout(() => {
    return res.send({
      event: Defs.ipcConnectionToken,
      data: { connToken: 'proxy-down' }
    });
  }, 5 * 1000);
  */
  ///*
  try {
    const qdata = await dequeue();
    log("POST proxy_down", "prxy", "info");
    res.send({method: qdata.req.method, originalUrl: qdata.req.originalUrl, body: qdata.req.body});
    // TODO finish server side request.
    await sleep(1000);
    qdata.res.send({
      event: JSON.stringify(req.body)
    });
  } catch (ex) {
     log("(Exception) POST proxy_down:" + ex, "prxy", "error");
  }
  //*/
});

module.exports = router;
