import DynamicsWebApi from "dynamics-web-api";
import store from "../store/store";
import * as actionTypes from "../store/actions";
import * as crmUtil from "./crmutil";
import { getConnection, updateToken } from "../services/LocalStorageService";
import { expand } from "../interfaces/expand";
import MsalNode from "@azure/msal-node"
import AuthProvider from "./Auth/AuthHelper";




export const create = async (createRequest: any, collectionOrLogicalName: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);

  return dynamicsWebAPIClient.create(createRequest, collectionOrLogicalName);
}


export const update = async (key: string, updateRequest: any, collectionOrLogicalName: string, prefer?: string | string[] | undefined, select?: string[] | undefined) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.update(key, collectionOrLogicalName, updateRequest, prefer, select);
}


export const executeUnboundFunction = async (functionName: string, parameters: any) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.executeUnboundFunction(functionName, parameters);
}

export const executeFetchXml = async (collectionName: string, fetchXml: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.fetch(collectionName, fetchXml);
}

export const retrieveEntitites = async (properties?: Array<string>, filter?: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveEntities(properties, filter);
};

export const retrieveEntity = async (entityKey: string, select?: Array<string>, expand?: Array<expand>) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveEntity(entityKey, select, expand);
}

export const retrieveAttribute = async (entityKey: string, attributeKey: string, attributeType: string | undefined, select?: Array<string>, expand?: Array<expand>) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveAttribute(entityKey, attributeKey, attributeType, select, expand);
}


export const retrieveAttributes = async (
  entityName: string,
  attributeType?: string,
  attributeProperties?: Array<string>,
  attributeFilter?: string,
  attributeExpand?: any
) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveAttributes(
    entityName,
    attributeType,
    attributeProperties,
    attributeFilter,
    attributeExpand
  );
};

export const retrieve = async (key: string, entityCollectionName: string, select?: Array<string>, expandArr?: Array<expand>) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieve(
    key,
    entityCollectionName,
    select,
    expandArr
  );
};

export const retrieveAll = async (entityCollectionName: string, select?: Array<string>, filter?: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveAll(entityCollectionName, select, filter);
};

export const retrieveRequest = async (request: any) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveRequest(request);
};

export const batchRetrieveMultipleRequests = async (retrieveMultipleRequests: any) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);

  dynamicsWebAPIClient.startBatch();
  retrieveMultipleRequests.forEach((requestObj: any) => {
    dynamicsWebAPIClient.retrieveMultipleRequest(requestObj);
  });

  let executeBatchPromise = dynamicsWebAPIClient.executeBatch();
  return executeBatchPromise;
};

export const retrieveMultiple = async (request: any) => {

  let dynamicsWebAPIClient = getWebAPIClient(true);
  let retrieveMultipleResponse = dynamicsWebAPIClient.retrieveMultipleRequest(
    request
  );
  return retrieveMultipleResponse;
};



export const associate = async (collection: string, primaryKey: string, relationshipName: string, relatedCollection: string, relatedKey: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);

  let associateRequest = dynamicsWebAPIClient.associate(collection, primaryKey, relationshipName, relatedCollection, relatedKey);

  return associateRequest;

}

export const disassociate = async (collection: string, primaryKey: string, relationshipName: string, relatedKey: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);

  let disassociateRequest = dynamicsWebAPIClient.disassociate(collection, primaryKey, relationshipName, relatedKey);

  return disassociateRequest;

}


export const getCurrentOrgUrl = () => {
  let token = getTokenFromStore();
  return token.resource;
};

function getWebAPIClient(useTokenRefresh: Boolean) {
  const currentToken = getTokenFromStore();


  let currentConnection = getCurrentConnectionFromStore()
  let baseUrl = currentConnection.orgUrl;
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  var webApiConfig: any = {
    webApiUrl: baseUrl + "/api/data/v9.1/",
    includeAnnotations: "OData.Community.Display.V1.FormattedValue"
  };


  webApiConfig.onTokenRefresh = acquireTokenForRefresh;


  let dynamicsWebAPIClient = new DynamicsWebApi(webApiConfig);

  return dynamicsWebAPIClient;
}

const acquireTokenForRefresh = async (dynamicsWebApiCallback: any) => {
  //check the token from the store
  const tokenData = getTokenFromStore();

  let currentConnection = getCurrentConnectionFromStore()



  let authProvider: AuthProvider = getAuthProviderFromStore();
  let token = await authProvider.getToken(currentConnection);


  dynamicsWebApiCallback(token?.accessToken);

}

function setTokenOnRequestIfValid(request: any) {
  const tokenData = getTokenFromStore();
  const tokenExpired = hasTokenExpired();
  if (!tokenExpired) {
    request.token = tokenData.accessToken;
  }
  return request;
}

function hasTokenExpired() {
  const tokenData = getTokenFromStore();
  const now = new Date();
  const tokenExpiresOn = new Date(tokenData.expiresOn);
  return now > tokenExpiresOn;
}

function getTokenFromStore() {
  const currentState = store.getState();
  return currentState != null ? currentState.tokenData : null;
}


function getCurrentConnectionFromStore() {
  const currentState = store.getState();
  return currentState != null ? currentState.currentConnection : null;
}



function getAuthProviderFromStore() {
  const currentState = store.getState();
  return currentState != null ? currentState.authProvider : null;
}

function updateTokenInStore(tokenData: any) {
  store.dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: tokenData });
}


function tooManyRequestsForToken(tokenExpiresOn: Date) {
  var now = new Date();
  var hourFromNow = now.setHours(now.getHours() + 1);
  var diffMs: number = (tokenExpiresOn.getTime() - hourFromNow);
  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  return (diffMins < 2);
}