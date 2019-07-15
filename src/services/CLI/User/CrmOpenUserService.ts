import { getCliResponse } from "../../../helpers/crmutil";
import { openWindow } from "../../../helpers/util";
import * as actionTypes from "../../../store/actions";
import { CliResponse } from "../../../interfaces/CliResponse";
import { CliData, ActionParam } from "../../../interfaces/CliData";

import {
  STR_NO_RECORDS_FOUND_FOR_CRITERIA,
  STR_ERROR_OCCURRED,
  STR_ONE_OR_MORE_RECORDS_FOUND_FOR_CRITERIA
} from "../../../helpers/strings";

import store from "../../../store/store";
import {
  retrieveMultiple,
  executeUnboundAction,
  getCurrentOrgUrl
} from "../../../helpers/webAPIClientHelper";

export const handleCrmOpenUserActions = async (
  cliData: CliData
): Promise<CliResponse> => {
  var hasNoparameters = !cliData.actionParams;

  let cliResponse: CliResponse = {
    message: "",
    success: false,
    response: null
  };


  if (hasNoparameters && !cliData.unnamedParam) {
    
  } else if (cliData.unnamedParam) {
    
  } else {
    cliResponse = await handleUserActionWithNamedParams(cliData);
  }
  return cliResponse;
};





export const handleUserActionWithNamedParams = async (
  cliData: CliData
): Promise<CliResponse> => {
  let cliResponse: CliResponse = {
    message: "",
    success: false,
    response: null
  };

  let attributesProvided =
    cliData && cliData.actionParams
      ? cliData.actionParams.map((x: any) => x.name)
      : [];
  let defaultAttributesOnUsers = getDefaultAttributesForSelect();
  let attributesNotInDefault = attributesProvided.filter(
    (x: any) => !defaultAttributesOnUsers.includes(x)
  );

  let matchedUsers = null;

  //custom query to filter the users
  let filter = generateFilterString(cliData.actionParams);

  try {
    matchedUsers = await getUsersFromCRM(
      cliData,
      [...defaultAttributesOnUsers, ...attributesNotInDefault],
      filter,
      null
    );
  } catch (error) {
    return getCliResponse(
      "message",
      null,
      false,
      `${STR_ERROR_OCCURRED} ${error.message}`
    );
  }

  let responseData = matchedUsers.value;

  if (responseData.length === 0) {
    return getCliResponse(
      "message",
      null,
      false,
      STR_NO_RECORDS_FOUND_FOR_CRITERIA
    );
  }

  if (responseData.length > 1) {
    return getCliResponse(
      "message",
      null,
      false,
      STR_NO_RECORDS_FOUND_FOR_CRITERIA
    );
  }

  const userId = responseData[0].systemuserid;
  const fullName = responseData[0].fullname;
  return getCliResponse(
    "open",
    { id: userId, logicalname: "systemuser", name: fullName },
    true,
    `User record ${fullName} opened successfully!`
  );
};

function generateFilterString(actionParams: any) {
  let filter = actionParams.reduce(
    (filterStr: string, param: any, index: number, arr: Array<any>) => {
      filterStr += param.name + " eq '" + param.value + "'" + " and ";
      if (arr.length === index + 1) {
        filterStr = filterStr.slice(0, -5);
      }
      return filterStr;
    },
    ""
  );

  return filter;
}


function getDefaultAttributesForSelect() {
  return [
    "fullname",
    "systemuserid",
    "domainname",
    "firstname",
    "lastname",
    "internalemailaddress"
  ];
}

const getUsersFromCRM = async (
  cliData : CliData,
  selectColumns: Array<string>,
  filter: string,
  onCliActionCompleteCallback: any
) => {
  var request = {
    collection: "systemusers",
    select: selectColumns,
    filter: filter
  };

  let retrieveUsersResponse = await retrieveMultiple(request);
  return retrieveUsersResponse;
};




function updateStoreWithUserData(users : any) {
  store.dispatch({ type: actionTypes.GET_CRM_USERS, crmUsers: users });
}

function updateStoreWithUserId(userId : string) {
  store.dispatch({
    type: actionTypes.GET_CURRENT_USER_ID,
    currentUserId: userId
  });
}

function getCurrentUserIdFromStore() {
  const currentState = store.getState();

  return currentState != null &&
    currentState.currentUser != null &&
    currentState.currentUser.Id != null
    ? currentState.currentUser
    : null;
}

function getUsersFromStore() {
  const currentState = store.getState();

  return currentState != null ? currentState.crmUsers : null;
}
