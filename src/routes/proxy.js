const express = require("express");
//const { resAreYouServerUuid } = require("iipzy-shared/src/defs");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
//const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
//const { sleep } = require("iipzy-shared/src/utils/utils");

const { enqueueReq } = require("./proxy_request_queue");

router.delete("/", async (req, res) => {
  log("proxy.delete: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );

  try {
    enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.delete: " + ex, "prxy", "info" );
  }
});

router.get("/", async (req, res) => {
  log("proxy.get: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info");

  try {
    enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.get: " + ex, "prxy", "info" );
  }
});

router.put("/", async (req, res) => {
  log("proxy.put: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );

  try {
    enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.put: " + ex, "prxy", "info" );
  }
});

router.post("/", async (req, res) => {
  log("proxy.post: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );
  
  try {
    enqueueReq(req, res);
   } catch (ex) {
    log("(Exception) proxy.post: " + ex, "prxy", "info" );
  }
});

module.exports = router;
