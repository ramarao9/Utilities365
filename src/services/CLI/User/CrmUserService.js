import IsEmpty from 'is-empty';
import { getOrgUrl } from '../../../helpers/crmutil';
import { openWindow } from '../../../helpers/util';
import DynamicsWebApi from 'dynamics-web-api';
import { reducer } from '../../../store/reducer';
import { createStore } from 'redux';
const store = createStore(reducer);

export function handleCrmUserActions(openUserActionParams, onactionCompleteCallback) {


    if (IsEmpty(openUserActionParams))
        return;

    const usersFromStore = getUsersFromStore();



    var hasNoNamedParameters = (openUserActionParams.length === 1 && IsEmpty(openUserActionParams[0].name));

    if (hasNoNamedParameters) {

        const userArgs = openUserActionParams[0].args;
        const userParamData = userArgs[0].value.trim().toLowerCase();

        if (userParamData === "me") {



        }
    }
    else {


    }

}



function getUsersFromCRM(onactionCompleteCallback) {




    const userUrl = getUserRecordUrl();
    openWindow(userUrl, true);

    onactionCompleteCallback("User record opened successfully");

    const tokenData = getTokenFromStore();

    var request = {
        collection: "systemuser",
        select: ["firstname", "lastname", "fullname", "systemuserid", "domainname"],
        filter: "statecode eq 0",
        token: tokenData.accessToken
    };

    //perform a multiple records retrieve operation
    this.dynamicsWebAPIClient.retrieveMultipleRequest(request).then(function (result) {



    }).catch(function (error) {
        //to do handle error

        var s = 100;
    });
}

function getUserRecordUrl() {
    const orgUrl = getOrgUrl();
    const userId = "8EB7BC60-C410-493C-88B3-AEB3BAC900CE";
    const userUrl = orgUrl + "main.aspx?etn=systemuser&pagetype=entityrecord&id=%7B" + userId + "%7D";
    return userUrl;
}

function updateStoreWithUserData(users) {

    store.dispatch({ type: actionTypes.GET_CRM_USERS, crmUsers: users });

}


function getUsersFromStore() {
    const currentState = store.getState();

    return (currentState != null) ? store.crmUsers : null;
}


function getTokenFromStore() {


    const currentState = store.getState();

    return (currentState != null) ? store.tokenData : null;
}