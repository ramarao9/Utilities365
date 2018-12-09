import IsEmpty from 'is-empty';
import { getOrgUrl } from '../../../helpers/crmutil';
import { openWindow } from '../../../helpers/util';
import DynamicsWebApi from 'dynamics-web-api';
import * as actionTypes from '../../../store/actions';
import * as crmUtil from '../../../helpers/crmutil';
import store from '../../../store/store';
import { retrieveMultiple, executeUnboundAction } from '../../../helpers/webAPIClientHelper';

export function handleCrmUserActions(openUserActionParams, onCliActionCompleteCallback) {

    if (IsEmpty(openUserActionParams))
        return;


    performOpenUserAction(openUserActionParams, onCliActionCompleteCallback);
}


function performOpenUserAction(openUserActionParams, onCliActionCompleteCallback) {
    var hasNoNamedParameters = (openUserActionParams.length === 1 && IsEmpty(openUserActionParams[0].name));

    if (hasNoNamedParameters) {
        handleUserActionWithNoNamedParams(openUserActionParams, onCliActionCompleteCallback);
    }
    else {
        handleUserActionWithNamedParams(openUserActionParams, onCliActionCompleteCallback);
    }

}


function handleUserActionWithNoNamedParams(openUserActionParams, onCliActionCompleteCallback) {
    const userArgs = openUserActionParams[0].args;
    const userParamData = userArgs[0].value.trim().toLowerCase();

    if (userParamData === "me") {
        const currentUserId = getCurrentUserIdFromStore();
        if (currentUserId == null) {//fetch from store for the first time

            executeUnboundAction("WhoAmI",
                onCurrentUserIdRetrievedSuccess,
                onCurrentUserIdRetrievedError,
                onCliActionCompleteCallback,
                openUserActionParams);

        }
        else {
            openUserRecord(currentUserId);
        }
    }
    else {

    }

}

function handleUserActionWithNamedParams(openUserActionParams, onCliActionCompleteCallback) {
    const usersFromStore = getUsersFromStore();
    if (usersFromStore === null || usersFromStore.length === 0) {
        getUsersFromCRM(openUserActionParams, onCliActionCompleteCallback);
    }
    else {

    }
}


function onCurrentUserIdRetrievedSuccess(response, onCliActionCompleteCallback, openUserActionParams) {
    const userId = response.UserId;
    updateStoreWithUserId(userId);
    openUserRecord(userId);

    onCliActionCompleteCallback("User record with Id: " + userId + " opened successfully");
}

function onCurrentUserIdRetrievedError() {

    //to do handle error
}


function openUserRecord(userId) {
    const userUrl = getUserRecordUrl(userId);
    openWindow(userUrl, true);
}

function getUsersFromCRM(openUserActionParams, onactionCompleteCallback) {


    const tokenData = getTokenFromStore();

    var request = {
        collection: "systemusers",
        select: ["firstname", "lastname", "fullname", "systemuserid", "domainname"],
        filter: "isdisabled eq false",
        token: tokenData.accessToken
    };

    let dynamicsWebAPIClient = new DynamicsWebApi({
        webApiUrl: crmUtil.getOrgUrl() + "api/data/v9.0/"
    });


    //perform a multiple records retrieve operation
    dynamicsWebAPIClient.retrieveMultipleRequest(request).then(function (result) {


        if (result != null && result.value != null && result.value.length > 0) {

            updateStoreWithUserData(result.value);

            performOpenUserAction(result.value, openUserActionParams, onactionCompleteCallback);
        }

    }).catch(function (error) {
        //to do handle error

        var s = 100;
    });
}


function getUserRecordUrl(userId) {
    const orgUrl = getOrgUrl();
    const userUrl = orgUrl + "main.aspx?etn=systemuser&pagetype=entityrecord&id=%7B" + userId + "%7D";
    return userUrl;
}

function updateStoreWithUserData(users) {
    store.dispatch({ type: actionTypes.GET_CRM_USERS, crmUsers: users });
}


function updateStoreWithUserId(userId) {
    store.dispatch({ type: actionTypes.GET_CURRENT_USER_ID, currentUserId: userId });
}

function getCurrentUserIdFromStore() {
    const currentState = store.getState();

    return (currentState != null && currentState.currentUser != null && currentState.currentUser.Id != null) ? currentState.currentUser : null;
}

function getUsersFromStore() {


    const currentState = store.getState();

    return (currentState != null) ? currentState.crmUsers : null;
}


function getTokenFromStore() {


    const currentState = store.getState();

    return (currentState != null) ? currentState.tokenData : null;
}

