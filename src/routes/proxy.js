const express = require("express");
const router = express.Router();
//const cors = require('cors');

const Defs = require("iipzy-shared/src/defs");
//const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
const { sleep } = require("iipzy-shared/src/utils/utils");

const { getQueue } = require("./proxy_client");
const { enqueueReq } = require("./proxy_request_queue");
const { getClientTokens, getState } = require("./proxy_client");

/*
const cors_options = {
  origin: ['https://iipzy.net*'],
  allowedHeaders: 'x-client-token'
};
*/

/*
function getClientToken(req) {
  return clientToken ? clientToken : req.query.clientToken;
}
*/

router.delete("/", async (req, res) => {
  const clientToken = req.header("x-client-token");
  log("proxy.delete: url = " + req.originalUrl + ", clientToken = " + clientToken, "prxy", "info" );

  try {
    getQueue(clientToken).enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.delete: " + ex, "prxy", "info" );
    await sleep();
    res.send({ __hadError__: { errorMessage: ex } });
  }
});

//router.get("/", cors(cors_options), async (req, res) => {
router.get("/", async (req, res) => {
  const clientToken = req.header("x-client-token");
  log("proxy.get: url = " + req.originalUrl + ", clientToken = " + clientToken, "prxy", "info");
  log("proxy.get: clientToken = " + req.header("x-client-token"), "prxy", "info");
  log("proxy.get: connectionToken = " + req.header("x-conn-token"), "prxy", "info");

  try {
    getQueue(clientToken).enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.get: " + ex, "prxy", "info" );
    await sleep();
    res.send({ __hadError__: { errorMessage: ex } });
  }
});

router.put("/", async (req, res) => {
  const clientToken = req.header("x-client-token");
  log("proxy.put: url = " + req.originalUrl + ", clientToken = " + clientToken, "prxy", "info" );

  try {
    getQueue(clientToken).enqueueReq(req, res);
  } catch (ex) {
    log("(Exception) proxy.put: " + ex, "prxy", "info" );
    await sleep();
    res.send({ __hadError__: { errorMessage: ex } });
  }
});

router.post("/", async (req, res) => {
  const clientToken = req.header("x-client-token");
  log("proxy.post: url = " + req.originalUrl + ", clientToken = " + clientToken, "prxy", "info" );
  
  try {
    getQueue(clientToken).enqueueReq(req, res);
   } catch (ex) {
    log("(Exception) proxy.post: " + ex, "prxy", "info" );
    await sleep();
    res.send({ __hadError__: { errorMessage: ex } });
  }
});

module.exports = router;
