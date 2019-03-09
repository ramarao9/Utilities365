
import { getOrgUrl } from '../../../helpers/crmutil';
import { openWindow } from '../../../helpers/util';
import * as actionTypes from '../../../store/actions';
import store from '../../../store/store';
import { retrieveMultiple, executeUnboundAction } from '../../../helpers/webAPIClientHelper';

export function handleCrmUserActions(cliData, onCliActionCompleteCallback) {

    var hasNoparameters = (!cliData.actionParams || cliData.actionParams.length === 0);

    if (hasNoparameters && !cliData.unnamedParam) {
        handleUserActionWithNoParams(cliData, onCliActionCompleteCallback);
    }
    else if (cliData.unnamedParam) {
        handleOpenUserActionWithUnNamedParam(cliData, onCliActionCompleteCallback);
    }
    else {
        handleUserActionWithNamedParams(cliData, onCliActionCompleteCallback);
    }

}



function handleUserActionWithNoParams(cliData, onCliActionCompleteCallback) {

    const target = cliData.target;

    if (target === "myuser") {
        const currentUserId = getCurrentUserIdFromStore();
        if (currentUserId == null) {//fetch from store for the first time
            executeUnboundAction("WhoAmI",
                onCurrentUserIdRetrievedSuccess,
                onCurrentUserIdRetrievedError,
                onCliActionCompleteCallback,
                cliData);
        }
        else {
            openUserRecord(currentUserId);
        }
    }


}

function handleOpenUserActionWithUnNamedParam(cliData, onCliActionCompleteCallback) {
    const unnamedParam = cliData.unnamedParam.toLowerCase();
    let users = getUsersFromStore();
    if (users != null && users.length > 0) {
        //Use the Function to get the user id
        let matchedUsers = users.filter(x => x.fullname.toLowerCase().includes(unnamedParam) || x.domainname.toLowerCase().includes(unnamedParam));
        processMatchedUsers(matchedUsers, onCliActionCompleteCallback);
    }
    else {
        getActiveUsersFromCRM(cliData, onCliActionCompleteCallback);
    }
}


function handleUserActionWithNamedParams(cliData, onCliActionCompleteCallback) {


    let attributesProvided = cliData.actionParams.map(x => x.name);
    let defaultAttributesOnUsers = getDefaultAttributesForSelect();
    let attributesNotInDefault = attributesProvided.filter(x => !defaultAttributesOnUsers.includes(x));

    const usersFromStore = getUsersFromStore();

    //

    if (attributesNotInDefault && attributesNotInDefault.length > 0) {
        //custom query to filter the users

        let filter = generateFilterString(cliData.actionParams);
        getUsersFromCRM(cliData, attributesProvided, filter, onCliActionCompleteCallback);

    }
    else if (usersFromStore && usersFromStore.length > 0) {
        //To do filter on the attributes
        let matchedUsers = usersFromStore.filter(filterOnAttributeValues, cliData.actionParams);
        processMatchedUsers(matchedUsers, onCliActionCompleteCallback);

    }
    else {
        getActiveUsersFromCRM(cliData, onCliActionCompleteCallback);

    }
}

function generateFilterString(actionParams) {


    let filter = actionParams.reduce((filterStr, param, index, arr) => {
        filterStr += param.name + " eq '" + param.value + "'" + " and ";
        if (arr.length === index + 1) {
            filterStr = filterStr.slice(0, -5);
        }
        return filterStr;
    }, "");


    return filter;
}

function filterOnAttributeValues(user) {

    let actionParams = this;


    let userMatched = actionParams.reduce((attributeMatched, param, index) => {


        let attDataMatched = (user.hasOwnProperty(param.name) && param.value && user[param.name].toLowerCase() === param.value.toLowerCase());
        if (index == 0) {
            attributeMatched = attDataMatched;
        }


        attributeMatched = attributeMatched && attDataMatched;
        return attributeMatched;
    }, false);


    return userMatched;
}

function getDefaultAttributesForSelect() {
    return ["fullname", "systemuserid", "domainname", "firstname", "lastname", "internalemailaddress"];
}


function processMatchedUsers(matchedUsers, onCliActionCompleteCallback) {
    if (matchedUsers != null && matchedUsers.length === 1) {
        openUserRecord(matchedUsers[0].systemuserid, onCliActionCompleteCallback);
    }
    else if (matchedUsers != null && matchedUsers.length > 1) {
        onCliActionCompleteCallback("More than one record found. Please refine the criteria and try again.");
    }
    else {
        onCliActionCompleteCallback("No records found. Please refine the criteria and try again.");
    }
}


function getUsersFromCRM(cliData, selectColumns, filter, onCliActionCompleteCallback) {

    var request = {
        collection: "systemusers",
        select: selectColumns,
        filter: filter
    }

    retrieveMultiple(request, getUsersFromCRMSuccess, getUsersFromCRMError, onCliActionCompleteCallback, cliData);
}


function getUsersFromCRMSuccess(result, onCliActionCompleteCallback, cliData) {
    if (result != null && result.value != null && result.value.length > 0) {
        processMatchedUsers(result.value, onCliActionCompleteCallback);
    }

}

function getUsersFromCRMError(error) {


}


function getActiveUsersFromCRM(cliData, onCliActionCompleteCallback) {

    var request = {
        collection: "systemusers",
        select: getDefaultAttributesForSelect(),
        filter: "isdisabled eq false"
    };
    retrieveMultiple(request, getActiveUsersFromCRMSuccess, getActiveUsersFromCRMError, onCliActionCompleteCallback, cliData);

}


function getActiveUsersFromCRMSuccess(result, onCliActionCompleteCallback, cliData) {
    if (result != null && result.value != null && result.value.length > 0) {

        updateStoreWithUserData(result.value);

        //Call the initial function as the store is now updated with the users
        handleCrmUserActions(cliData, onCliActionCompleteCallback);
    }

}

function getActiveUsersFromCRMError(error) {


}




function onCurrentUserIdRetrievedSuccess(response, onCliActionCompleteCallback, cliData) {
    const userId = response.UserId;
    updateStoreWithUserId(userId);
    openUserRecord(userId, onCliActionCompleteCallback);


}

function onCurrentUserIdRetrievedError() {

    //to do handle error
}


function openUserRecord(userId, onCliActionCompleteCallback) {
    const userUrl = getUserRecordUrl(userId);
    openWindow(userUrl, true);

    onCliActionCompleteCallback("User record with Id: " + userId + " opened successfully");
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




