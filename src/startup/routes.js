const express = require("express");

const Defs = require("iipzy-shared/src/defs");
const { log } = require("iipzy-shared/src/utils/logFile");

const proxy = require("../routes/proxy");
const proxy_down = require("../routes/proxy_down");
const proxy_up = require("../routes/proxy_up");
const testRoute = require("../routes/testRoute");
const error = require("../middleware/error");

/*
  httpCustomHeader_XAuthToken: "x-auth-token",
  httpCustomHeader_XClientToken: "x-client-token",
  httpCustomHeader_XConnToken: "x-conn-token",
  httpCustomHeader_XTimestamp: "x-timestamp",
*/

module.exports = function(app) {
  log("routes", "rout", "info");
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, GET, POST, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, " +
        Defs.httpCustomHeader_XAuthToken +
        ", " +
        Defs.httpCustomHeader_XConnToken +
        ", " +
        Defs.httpCustomHeader_XTimestamp +
        ", " +
        Defs.httpCustomHeader_XWebClient
    );
    res.header("Content-Type", "application/x-www-form-urlencoded");
    next();
  });
  app.use(express.json());
  /*
  app.use("/api/credentials", proxy);
  app.use("/api/devices", proxy);
  app.use("/api/discovery", proxy);
  app.use("/api/eventWait", proxy);
  app.use("/api/request", proxy);
  app.use("/api/settings", proxy);
  */
  app.use("/api/proxy_down", proxy_down);
  app.use("/api/proxy_up", proxy_up);
  app.use("/express_backend", testRoute);
  app.use("/*", proxy);
  app.use(error);
};
