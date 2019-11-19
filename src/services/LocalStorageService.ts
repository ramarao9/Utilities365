

const Store = window.require("electron-store");


export const setConfigData = (key:any, value:any) => {
  const localUserConfigStore = new Store();

  localUserConfigStore.set(key, value);
};

export const getConfigData = (key:any) => {
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

export const saveConnection = (connectionInfo: any) => {
  let connections = getConnections();

  connections = connections.filter((x:any) => x.orgUrl !== connectionInfo.orgUrl);
  connections.push(connectionInfo);

  setConfigData("Connections", connections);
};

export const getConnection = (orgUrl:any) => {
  let connections = getConnections();

  let connection = connections.find((x:any) => x.orgUrl === orgUrl);
  return connection;
};

export const removeConnection = (orgUrl:any) => {
  let connections = getConnections();
  connections = connections.filter((x:any)=> x.orgUrl !== orgUrl);
  setConfigData("Connections", connections);

  return connections;
};

export const updateToken = (tokenData:any) => {
  let connection = getConnection(tokenData.resource);
  connection.accessToken = tokenData;
  saveConnection(connection);
};
