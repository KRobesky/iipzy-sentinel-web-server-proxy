const express = require("express");
const router = express.Router();

const Defs = require("iipzy-shared/src/defs");
const { handleError } = require("iipzy-shared/src/utils/handleError");
const { log, timestampToString } = require("iipzy-shared/src/utils/logFile");
const { enqueue } = require("./proxy_down_queue");
//const { createConnectionUuid, getConnectionUuid } = require("../ipc/connection");
//const { eventWaiter } = require("../ipc/eventWaiter");
//const { sendDelayedResults } = require("../utils/sendDelayedResults");
//const { isValidConnection } = require("./validateConnection");

router.get("/", async (req, res) => {
  log("GET eventWait: timestamp = " + timestampToString(req.header("x-timestamp")), "ewat", "info");

  enqueue("eventWait", req, res);

  setTimeout(() => {
    return res.send({
      event: Defs.ipcConnectionToken,
      data: { connToken: 'biteme' }
    });
  }, 5 * 1000);

  /*
  // NB: for web clients, this is where we hand out connection tokens.
  const connToken = req.header(Defs.httpCustomHeader_XConnToken);
  const isWebClient = req.header(Defs.httpCustomHeader_XWebClient);
  log("GET eventWait: connToken = " + connToken + ", isWebClient = " + isWebClient, "ewat", "info");
  if (isWebClient) {
    if (connToken) {
      const connectionUuid = getConnectionUuid();
      if (!connectionUuid) {
        // no connectionUuid means First time connection after Sentinel restart.
        const connToken = createConnectionUuid(req.ip);
        return res.send({
          event: Defs.ipcConnectionToken,
          data: { connToken }
        });
      }

      if (connToken !== connectionUuid) {
        // inUse by another client.
        log("GET eventWait: Sentinel is in use by another client", "ewat", "info");
        return sendDelayedResults(
          res,
          Defs.httpStatusSentinelInUse,
          handleError(
            Defs.objectType_clientInstance,
            "",
            Defs.statusSentinelInUse,
            "Access denied. Sentinel is in use by another client"
          ),
          1 * 1000
        );
      }
    } else {
      // no connToken means First time connection from new client.
      // NB: Take over from any currently connected client.
      const connToken = createConnectionUuid(req.ip);
      return res.send({ event: Defs.ipcConnectionToken, data: { connToken } });
    }
  } else {
    if (!isValidConnection(res, connToken)) return;
  }

  // let connToken = req.header("x-conn-token");
  // if (!connToken) connToken = "";
  // log("connToken=" + connToken, "dscv", "info");

  // let connectionUuid = getConnectionUuid();
  // log("connUuid =" + connectionUuid, "dscv", "info");

  // let inUse = false;
  // if (connectionUuid && connToken !== connectionUuid) inUse = true;

  // log("inUse =" + inUse, "dscv", "info");

  // if (!inUse) connectionUuid = createConnectionUuidIfNoConnection();
  // else connectionUuid = "";

  //??if (!isValidConnection(res, connToken)) return;

  res.send(await eventWaiter());
  */
});

module.exports = router;
