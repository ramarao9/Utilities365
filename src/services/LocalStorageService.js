const Store = window.require("electron-store");

export const setConfigData = (key, value) => {
  const localUserConfigStore = new Store();

  localUserConfigStore.set(key, value);
};

export const getConfigData = key => {
  const localUserConfigStore = new Store();

  let configData = localUserConfigStore.get(key);
  return configData;
};

export const getConnections = () => {
  let connections = getConfigData("Connections");

  if (connections == null) {
    connections = [];
  }

  return connections;
};

export const saveConnection = connectionInfo => {
  let connections = getConnections();

  connections = connections.filter(x => x.orgUrl !== connectionInfo.orgUrl);
  connections.push(connectionInfo);

  setConfigData("Connections", connections);
};

export const getConnection = orgUrl => {
  let connections = getConnections();

  let connection = connections.find(x => x.orgUrl === orgUrl);
  return connection;
};

export const removeConnection = orgUrl => {
  let connections = getConnections();
  connections = connections.filter(x => x.orgUrl !== orgUrl);
  setConfigData("Connections", connections);

  return connections;
};

export const updateToken = tokenData => {
  let connection = getConnection(tokenData.resource);
  connection.accessToken = tokenData;
  saveConnection(connection);
};
