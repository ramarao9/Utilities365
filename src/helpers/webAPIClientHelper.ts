import DynamicsWebApi from "dynamics-web-api";
import store from "../store/store";
import * as actionTypes from "../store/actions";
import * as crmUtil from "./crmutil";
import { getConnection, updateToken } from "../services/LocalStorageService";
import { expand } from "../interfaces/expand";
import AdalNode from "adal-node";



export const create = async (createRequest: any, collectionOrLogicalName: string) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.create(createRequest, collectionOrLogicalName);
}


export const update = async (key :string,updateRequest: any, collectionOrLogicalName: string, prefer?: string | string[] | undefined,select?: string[] | undefined) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.update(key,collectionOrLogicalName, updateRequest,prefer, select);
}


export function executeUnboundAction(
  functionName: string,
  successCallback: any,
  errorCallback: any,
  passThroughCallback: any,
  passThroughObj: any
) {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  dynamicsWebAPIClient
    .executeUnboundFunction(functionName)
    .then(function (response) {
      successCallback(response, passThroughCallback, passThroughObj);
    })
    .catch(function (error) {
      errorCallback(error, passThroughCallback, passThroughObj);
    });
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
  let dynamicsWebAPIClient = getWebAPIClient(false);
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
  request = setTokenOnRequestIfValid(request);
  let dynamicsWebAPIClient = getWebAPIClient(false);
  let retrieveMultipleResponse = dynamicsWebAPIClient.retrieveMultipleRequest(
    request
  );
  return retrieveMultipleResponse;
};



export const getCurrentOrgUrl = () => {
  let token = getTokenFromStore();
  return token.resource;
};

function getWebAPIClient(useTokenRefresh: Boolean) {
  const currentToken = getTokenFromStore();
  var webApiConfig: any = { webApiUrl: currentToken.resource + "/api/data/v9.1/" };

  const tokenExpired = hasTokenExpired();

  if (tokenExpired || useTokenRefresh) {
    //Need to use for UnboundExecute Action
    webApiConfig.onTokenRefresh = acquireTokenForRefresh;
  }

  let dynamicsWebAPIClient = new DynamicsWebApi(webApiConfig);

  return dynamicsWebAPIClient;
}

function acquireTokenForRefresh(dynamicsWebApiCallback: any) {
  //check the token from the store
  const tokenData = getTokenFromStore();
  function adalCallback(error: any, token: any) {
    if (!error) {
      //call DynamicsWebApi callback only when a token has been retrieved
      dynamicsWebApiCallback(token);
      //Update the token in the store
      updateTokenInStore(token);
      //update the token in local storage
      updateToken(token);
    } else {
      console.log("Token has not been retrieved. Error: " + error.stack);
    }
  }

  let tenantId = tokenData.tenantId;
  let authorizationEndpointUri = "";
  if (tenantId) {
    authorizationEndpointUri = crmUtil.getAuthorizationEndpoint(
      tokenData.tenantId
    );
  } else {
    authorizationEndpointUri = tokenData._authority;
  }

  var authContext = new AdalNode.AuthenticationContext(
    authorizationEndpointUri
  );

  let connectionInfo = getConnection(tokenData.resource);

  if (tokenData.refreshToken) {
    authContext.acquireTokenWithRefreshToken(
      tokenData.refreshToken,
      connectionInfo.appId,
      "",
      tokenData.resource,
      adalCallback
    );
  } else {
    authContext.acquireTokenWithClientCredentials(
      connectionInfo.orgUrl,
      connectionInfo.appId,
      connectionInfo.clientSecret,
      adalCallback
    );

  }
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
  const tokenExpiresOn = new Date(tokenData.expiresOn * 1000);
  return now > tokenExpiresOn;
}

function getTokenFromStore() {
  const currentState = store.getState();
  return currentState != null ? currentState.tokenData : null;
}

function updateTokenInStore(tokenData: any) {
  store.dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: tokenData });
}
