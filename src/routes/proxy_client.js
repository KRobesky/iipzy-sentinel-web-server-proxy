//const Defs = require("iipzy-shared/src/defs");
const { log } = require("iipzy-shared/src/utils/logFile");

const clientStateByClientToken = new Map();

function deleteState(clientToken) {
  log("deleteState: clientToken = " + clientToken, "prxy", "info");
  clientStateByClientToken.delete(clientToken);
}

function getClientTokens() {
  return [ ...clientStateByClientToken.keys() ];
}

function getQueue(clientToken) {
  log("getQueue: clientToken = " + clientToken, "prxy", "info");
  const { queue } = clientStateByClientToken.get(clientToken);
  return queue;
}

function getState(clientToken) {
  log("getState: clientToken = " + clientToken, "prxy", "info");
  return clientStateByClientToken.get(clientToken);
}

function setState(clientToken, client_state, queue) {
  log("setState: clientToken = " + clientToken, "prxy", "info");
  clientStateByClientToken.set(clientToken, { client_state, queue });
}

module.exports = { deleteState, getClientTokens, getQueue, getState, setState };
