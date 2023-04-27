const express = require("express");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
//const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
const { enqueue } = require("./proxy_down_queue");

router.delete("/", async (req, res) => {
  log("proxy.delete: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );

  enqueue(req, res);

  res.send({});
});

router.get("/", async (req, res) => {
  log("proxy.get: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info");

  enqueue(req, res);
});

router.put("/", async (req, res) => {
  log("proxy.put: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );

  enqueue(req, res);

  res.send({});
});

router.post("/", async (req, res) => {
  log("proxy.post: url = " + req.originalUrl + ", timestamp = " + timestampToString(req.header("x-timestamp")), "prxy", "info" );
  
  enqueue(req, res);
});

module.exports = router;
