
import { CliData, ActionParam } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { retrieveMultiple } from "../../../helpers/webAPIClientHelper"
import { getErrorResponse } from "../CliResponseUtil";

import {
    STR_ERROR_OCCURRED
  } from "../../../helpers/strings";
  
export const handleCrmGetActions = async (cliData: CliData) => {
    let cliResponse: CliResponse = { message: "", success: false, type: "" };
  
    try {
      let retrieveResponse=await getRecords(cliData);
      cliResponse.success = true;
      cliResponse.message = "";
      cliResponse.response={primaryidattribute:getPrimaryIdAttribute(cliData.target),data:retrieveResponse};
    }
    catch (error) {
      console.log(error);
      return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
    }
  
  
    return cliResponse;
  };


const getRecords = async (cliData: CliData) => {


    let retrieveRequest = await getRequestBody(cliData);

    let retrieveResponse = await retrieveMultiple(retrieveRequest);

    return retrieveResponse.value;

};


const getRequestBody = (cliData: CliData): any => {


    let actionParams = cliData.actionParams;
    if (actionParams == null)
        return null;

    let filterParam: ActionParam = getActionParam("filter", actionParams);
    let selectParam: ActionParam = getActionParam("select", actionParams);
    let topParam: ActionParam = getActionParam("top", actionParams);


    let retrieveMultipleRequest: any = {};
    retrieveMultipleRequest.collection=cliData.target;
    if (filterParam != null && filterParam.value != null) {
        retrieveMultipleRequest.filter = filterParam.value;
    }

    if (selectParam != null && selectParam.value != null) {
        let attributesCSV = selectParam.value as string;
        retrieveMultipleRequest.select = attributesCSV.split(",");
    }

    if (topParam != null && topParam.value != null) {
        retrieveMultipleRequest.top = topParam.value;
    }


    return retrieveMultipleRequest;

}


const getActionParam = (parameterName: string, actionParams: Array<ActionParam>): ActionParam => {
    let match: ActionParam = actionParams.find(x => x.name != null && x.name.toLowerCase() === parameterName) as ActionParam;
    return match;
}


const getPrimaryIdAttribute=(collectionName: string): string=>{


  if(collectionName==null)
  return "";

  return `${collectionName.slice(0,-1).toLowerCase()}id`;

}