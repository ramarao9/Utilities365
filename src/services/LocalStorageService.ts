import { AuthConnection } from "../interfaces/Auth/AuthConnection";
import { ConnectionUI } from "../interfaces/Auth/Connection";


const Store = window.require("electron-store");


export const setConfigData = (key: any, value: any) => {
  const localUserConfigStore = new Store();

  localUserConfigStore.set(key, value);
};

export const getConfigData = (key: any) => {
  const localUserConfigStore = new Store();

  let configData = localUserConfigStore.get(key);
  return configData;
};

export const getConnections = (): Array<AuthConnection> => {
  let connections = getConfigData("Connections");

  if (connections == null) {
    connections = [];
  }

  return connections;
};

export const saveConnection = (connectionInfo: AuthConnection) => {
  let connections = getConnections();


  let existingConnectionIndex = connections.findIndex((x: AuthConnection) => (x.orgUrl === connectionInfo.orgUrl && x.appId === connectionInfo.appId));

  if (existingConnectionIndex != -1) {
    connections[existingConnectionIndex] = connectionInfo;
  }
  else {
    connections.push(connectionInfo);
  }





  setConfigData("Connections", connections);
};



export const getConnection = (connectionInfo: AuthConnection) => {
  let connections = getConnections();

  let connection = connections.find((x: any) => x.orgUrl === connectionInfo.orgUrl && x.appId===connectionInfo.appId);
  return connection;
};

export const removeConnection = (connectionInfo: AuthConnection) => {
  let connections = getConnections();

  let existingConnectionIndex = connections.findIndex((x: AuthConnection) => (x.orgUrl === connectionInfo.orgUrl && x.appId === connectionInfo.appId));
  connections.splice(existingConnectionIndex,1);

  setConfigData("Connections", connections);

  return connections;
};

export const updateToken = (tokenData: any) => {
  let connection = getConnection(tokenData.resource);
  if (connection) {
    connection.accessToken = tokenData;
    saveConnection(connection);
  }

};