import { getCliResponse } from "../../../helpers/crmutil";
import { STR_ERROR_OCCURRED, STR_NO_RECORDS_FOUND_FOR_CRITERIA } from "../../../helpers/strings";
import { retrieveMultiple } from "../../../helpers/webAPIClientHelper";
import { CliData } from "../../../interfaces/CliData";
import { CliResponse, CliResponseType } from "../../../interfaces/CliResponse";
import * as actionTypes from "../../../store/actions";
import store from "../../../store/store";



export const handleCrmOpenUserActions = async (
  cliData: CliData
): Promise<CliResponse> => {
  var hasNoparameters = !cliData.actionParams;

  let cliResponse: CliResponse = {
    type: CliResponseType.None,
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
    type: CliResponseType.None,
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
  } catch (error: any) {
    return getCliResponse(
      CliResponseType.Message,
      `${STR_ERROR_OCCURRED} ${error.message}`,
      false,
      false
    );
  }

  let responseData: any = matchedUsers.value;

  if (responseData.length === 0) {
    return getCliResponse(
      CliResponseType.Message,
      STR_NO_RECORDS_FOUND_FOR_CRITERIA,
      false,
      false
    );
  }

  if (responseData.length > 1) {
    return getCliResponse(
      CliResponseType.Message,
      STR_NO_RECORDS_FOUND_FOR_CRITERIA,
      false,
      false
    );
  }

  const userId = responseData[0].systemuserid;
  const fullName = responseData[0].fullname;
  return getCliResponse(
    CliResponseType.RECORD_OPEN,
    `User record ${fullName} opened successfully!`,
    { id: userId, logicalname: "systemuser", name: fullName },
    true

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
  cliData: CliData,
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

function updateStoreWithUserData(users: any) {
  store.dispatch({ type: actionTypes.GET_CRM_USERS, crmUsers: users });
}

function updateStoreWithUserId(userId: string) {
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
