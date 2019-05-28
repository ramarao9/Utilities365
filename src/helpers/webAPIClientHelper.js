import DynamicsWebApi from "dynamics-web-api";
import store from "../store/store";
import * as actionTypes from "../store/actions";
import * as crmUtil from "./crmutil";
import { getConnection, updateToken } from "../services/LocalStorageService";

import AdalNode from "adal-node";
const isDev = window.require("electron-is-dev");

export function executeUnboundAction(
  functionName,
  successCallback,
  errorCallback,
  passThroughCallback,
  passThroughObj
) {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  dynamicsWebAPIClient
    .executeUnboundFunction(functionName)
    .then(function(response) {
      successCallback(response, passThroughCallback, passThroughObj);
    })
    .catch(function(error) {
      errorCallback(error, passThroughCallback, passThroughObj);
    });
}
export const retrieve = async request => {
  let dynamicsWebAPIClient = getWebAPIClient();
  return dynamicsWebAPIClient.retrieve(request);
};

export const batchRetrieveMultipleRequests = async retrieveMultipleRequests => {
  let dynamicsWebAPIClient = getWebAPIClient(true);

  dynamicsWebAPIClient.startBatch();
  retrieveMultipleRequests.forEach(requestObj => {
    dynamicsWebAPIClient.retrieveMultipleRequest(requestObj);
  });

  let executeBatchPromise = dynamicsWebAPIClient.executeBatch();
  return executeBatchPromise;
};

export const retrieveMultiple = async request => {
  request = setTokenOnRequestIfValid(request);
  let dynamicsWebAPIClient = getWebAPIClient();
  let retrieveMultipleResponse = dynamicsWebAPIClient.retrieveMultipleRequest(
    request
  );
  return retrieveMultipleResponse;
};

export const retrieveEntitites = async (properties, filter) => {
  let dynamicsWebAPIClient = getWebAPIClient(true);
  return dynamicsWebAPIClient.retrieveEntities(properties, filter);
};

export const getCurrentOrgUrl = () => {
  let token = getTokenFromStore();
  return token.resource;
};

function getWebAPIClient(useTokenRefresh) {
  const currentToken = getTokenFromStore();
  var webApiConfig = { webApiUrl: currentToken.resource + "/api/data/v9.1/" };

  const tokenExpired = hasTokenExpired();

  if (tokenExpired || useTokenRefresh) {
    //Need to use for UnboundExecute Action
    webApiConfig.onTokenRefresh = acquireTokenForRefresh;
  }

  let dynamicsWebAPIClient = new DynamicsWebApi(webApiConfig);

  return dynamicsWebAPIClient;
}

function acquireTokenForRefresh(dynamicsWebApiCallback) {
  //check the token from the store
  const tokenData = getTokenFromStore();
  function adalCallback(error, token) {
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

  var authorizationEndpointUri = crmUtil.getAuthorizationEndpoint(
    tokenData.tenantId
  );
  var authContext = new AdalNode.AuthenticationContext(
    authorizationEndpointUri
  );

  let connectionInfo = getConnection(tokenData.resource);

  authContext.acquireTokenWithRefreshToken(
    tokenData.refreshToken,
    connectionInfo.appId,
    null,
    tokenData.resource,
    adalCallback
  );
}

function setTokenOnRequestIfValid(request) {
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

function updateTokenInStore(tokenData) {
  store.dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: tokenData });
}
