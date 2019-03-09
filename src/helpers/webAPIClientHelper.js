import DynamicsWebApi from 'dynamics-web-api';
import store from '../store/store';
import * as actionTypes from '../store/actions';
import * as crmUtil from './crmutil';
import AdalNode from 'adal-node';
const isDev = window.require('electron-is-dev');


export function retrieveMultiple(request, successCallback, errorCallback, passThroughCallback, passThroughObj) {
    request = setTokenOnRequestIfValid(request);

    //Handle token if it expired or null etc. or change the implementation to use callback funtion for token to retrieve it before every request
    let dynamicsWebAPIClient = getWebAPIClient();

    dynamicsWebAPIClient.retrieveMultipleRequest(request).then(function (result) {
        successCallback(result, passThroughCallback, passThroughObj);
    }).catch(function (error) {
        errorCallback(error, passThroughCallback, passThroughObj);
    });
}

export function executeUnboundAction(functionName, successCallback, errorCallback, passThroughCallback, passThroughObj) {

    let dynamicsWebAPIClient = getWebAPIClient(true);
    dynamicsWebAPIClient.executeUnboundFunction(functionName).then(function (response) {
        successCallback(response, passThroughCallback, passThroughObj);
    }).catch(function (error) {
        errorCallback(error, passThroughCallback, passThroughObj);
    });


}




export const retrieveEntitites = async (properties, filter) => {

    let dynamicsWebAPIClient = getWebAPIClient();
    dynamicsWebAPIClient.retrieveEntities(properties, filter).then(function (response) {
        return response;
    }).catch(function (error) {
       return error;
    }); 

}


function getWebAPIClient(useTokenRefresh) {

    var webApiConfig = { webApiUrl: crmUtil.getOrgUrl() + "api/data/v9.0/" };


    const tokenExpired = hasTokenExpired();

    if (tokenExpired || useTokenRefresh) {//Need to use for UnboundExecute Action
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
        }
        else {
            if (isDev) {
                dynamicsWebApiCallback(tokenData);
            }

            console.log('Token has not been retrieved. Error: ' + error.stack);
        }
    }

    var authorityUri = crmUtil.getAuthorityUri();
    var resource = crmUtil.getOrgUrl();
    var authContext = new AdalNode.AuthenticationContext(authorityUri);
    authContext.acquireTokenWithRefreshToken(tokenData.refreshToken, tokenData.idToken, resource, adalCallback);
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
    return (now > tokenExpiresOn);
}



function getTokenFromStore() {
    const currentState = store.getState();
    return (currentState != null) ? currentState.tokenData : null;
}


function updateTokenInStore(tokenData) {
    store.dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: tokenData });
}