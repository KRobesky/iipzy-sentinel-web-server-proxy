const express = require("express");
const app = express();
const cors = require('cors');
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

     server = https.createServer(
      {
        key: fs.readFileSync(Defs.server_key),
        cert: fs.readFileSync(Defs.server_cert)
      },
      app
    ).listen(Defs.port_sentinel_web_server_proxy, () => {
      log(`Listening on port ${Defs.port_sentinel_web_server_proxy}...`, "main", "info");
    });
  } catch(ex) {
    log("(Exception main: " + ex, "main", "error");
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

