const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const http = require('http');

const Defs = require("iipzy-shared/src/defs");
const { ConfigFile } = require("iipzy-shared/src/utils/configFile");
const {
  fileExistsAsync,
  fileDeleteAsync,
  fileReadAsync,
  fileWriteAsync
} = require("iipzy-shared/src/utils/fileIO");
const { log, logInit, setLogLevel } = require("iipzy-shared/src/utils/logFile");
//const periodicHandler = require("iipzy-shared/src/utils/periodicHandler");
const { processErrorHandler } = require("iipzy-shared/src/utils/utils");

const logPath = "/var/log";
logInit(logPath, "iipzy-sentinel-web-server-proxy");

require("./startup/routes")(app);
/*
const {
  init: monitorEventsInit
} = require("./backgroundServices/monitorEvents");
const { init: userInit } = require("./backgroundServices/user");
*/
//const { addEvent } = require("./db/eventDB");

const userDataPath = "/etc/iipzy";

let configFile = null;

let logLevel = undefined;

let proxy_server = null;
let local_server = null;

const highCpuPercentAlertMinutes = 1;
const highCpuPercentAlertThreshold = 50;
let highCpuPercentStartTime = 0;
let highCpuPercentAlertSent = false;

async function main() {
  try {
    configFile = new ConfigFile(userDataPath, Defs.configFilename);
    await configFile.init();
    configFile.watch(configWatchCallback);
    logLevel = configFile.get("logLevel");
    if (logLevel) setLogLevel(logLevel);
    else configFile.set("logLevel", "info");

    /*
    monitorEventsInit();
    userInit();
    periodicHandler.init({});
    await checkProcessStopFile();
    */

    //const port = process.env.PORT || config.get("port");
    log ("__dirname = " + __dirname, "main", "info");
    server = https.createServer(
      {
        key: fs.readFileSync(__dirname + "/certificate/server.key"),
        cert: fs.readFileSync(__dirname + "/certificate/server.cert")
      },
      app
    ).listen(Defs.port_sentinel_core, () => {
      log(`Listening on port ${Defs.port_sentinel_core}...`, "main", "info");
    });
  } catch(ex) {
    log("(Exception main: " + ex, "main", "error");
  }

// server = app.listen(port, () =>
//   log(`Listening on port ${port}...`, "main", "info")
// );

 /*
  app.get('/', (req, res) => {
    log("---got a request", "main", "info");
    res.send('Hello World!')
  })
  */

  /*
  local_server = http.createServer(function(req, res) { 
    log("http.createServer: request = " + req);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Bite me!');
    res.end();
   }).listen(Defs.port_sentinel_core, "127.0.0.1");
  */
  /*
  local_server.listen(Defs.port_sentinel_core, "127.0.0.1", function() { 
    log("local_server.listen");
  });
  */

  /*
  const local_port = Defs.port_sentinel_core;
  local_server = app.listen(local_port, async () => {
    log(`Listening on port ${local_port}...`, "main", "info");
  });
  */

}

function configWatchCallback() {
  log("configWatchCallback", "main", "info");
  const logLevel_ = configFile.get("logLevel");
  if (logLevel_ !== logLevel) {
    log(
      "configWatchCallback: logLevel change: old = " +
        logLevel +
        ", new = " +
        logLevel_,
      "main",
      "info"
    );
  }
  if (logLevel_) {
    // tell log.
    logLevel = logLevel_;
    setLogLevel(logLevel);
  }
}

processErrorHandler(processStopHandler, processAlertHandler);

main();

async function processStopHandler(message) {
  console.log(
    "-----------------------processStopHandler: message = '" + message + "'"
  );
  const processStopMessage = userDataPath + "/" + Defs.crashFilename;
  await fileWriteAsync(processStopMessage, message);
  console.log("<<<-----------------------processStopHandler");
}

async function checkProcessStopFile() {
  /*
  const processStopMessage = userDataPath + "/" + Defs.crashFilename;
  if (await fileExistsAsync(processStopMessage)) {
    const message = await fileReadAsync(processStopMessage);

    log("checkProcessStopFile: message = '" + message + "'", "main", "info");

    const eventJSON = JSON.stringify({
      clientToken: "server",
      clientName: "server",
      userId: Defs.headBuzzardUserId,
      isOnLine: false,
      isLoggedIn: false,
      message: message.toString()
    });

    await addEvent(
      Defs.eventClass_crash,
      Defs.objectType_server,
      0,
      Defs.eventClass_null,
      Defs.objectType_null,
      Defs.eventId_null,
      Defs.eventActive_activeAutoInactive,
      eventJSON,
      Defs.headBuzzardUserId
    );

    await fileDeleteAsync(processStopMessage);
    await fileDeleteAsync(processStopMessage + ".bak");
  }
  */
}

async function processAlertHandler(message) {
  log("processAlertHandler: message = '" + message + "'", "main", "info");
  /*
  const eventJSON = JSON.stringify({
    clientToken: "server",
    clientName: "server",
    userId: Defs.headBuzzardUserId,
    isOnLine: false,
    isLoggedIn: false,
    message: message.toString()
  });

  await addEvent(
    Defs.eventClass_crash,
    Defs.objectType_server,
    0,
    Defs.eventClass_null,
    Defs.objectType_null,
    Defs.eventId_null,
    Defs.eventActive_activeAutoInactive,
    eventJSON,
    Defs.headBuzzardUserId
  );
  */
}

module.exports = local_server;

