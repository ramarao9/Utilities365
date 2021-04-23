import IsEmpty from "is-empty";
import { getEntityMetadataBasic } from "../../CrmMetadataService";
import { retrieveMultiple } from "../../../helpers/webAPIClientHelper";
import { isValidGuid } from "../../../helpers/common";

import { getErrorResponse, getTextResponse } from "../CliResponseUtil";
import { getCurrentOrgUrl } from "../../../helpers/webAPIClientHelper";
import { openWindow } from "../../../helpers/util";
import { CliResponse } from "../../../interfaces/CliResponse";
import { ActionParam, CliData } from "../../../interfaces/CliData";
import { getActionParam } from "../../../helpers/common";
import { EntityReference } from "../../../interfaces/EntityReference";
import {
  STR_NO_RECORDS_FOUND_FOR_CRITERIA,
  STR_ERROR_OCCURRED,
  STR_ONE_OR_MORE_RECORDS_FOUND_FOR_CRITERIA
} from "../../../helpers/strings";
import { EntityMetadata } from "../../../interfaces/EntityMetadata";

export const handleCrmOpenActions = async (
  cliData: any
): Promise<CliResponse> => {
  let cliResponse: CliResponse = {
    type: "",
    message: "",
    success: false,
    response: null
  };

  const target = cliData.target;

  if (IsEmpty(target)) {
    return getErrorResponse(
      `Unable to determine the target on which ${cliData.action
      } needs to be performed`
    );


  }

  switch (target.toLowerCase().trim()) {
    case "advfind":
    case "advancedfind":
    case "search": cliResponse = openAdvFind();
      break;

    case "new-record": cliResponse = openNewRecord(cliData);
      break;


    case "entity": cliResponse = await openEntity(cliData);
      break;

    case "view": cliResponse = openView(cliData);
      break;



    //Default is opening the entity record using the params
    default:
      cliResponse = await handleOpenRecordAction(cliData);
      break;
  }

  return cliResponse;
};

const openAdvFind = () => {

  let advFindUrl = `${getCurrentOrgUrl()}/main.aspx?pagetype=AdvancedFind`;
  openWindow(advFindUrl, true);

  return getTextResponse("Advanced Find opened successfully!");
}


const openNewRecord = (cliData: CliData): CliResponse => {

  try {

    if (!cliData.actionParams)
      return getErrorResponse(`Need to provide atleast the entity param`);

    let entityParam = getActionParam("entity", cliData.actionParams!!);

    if (!entityParam || !entityParam.value)
      return getErrorResponse(`Please specify the entity to open the new record form.`);

    let entityName: string = entityParam.value;

    let appParam = getActionParam("app", cliData.actionParams!!);
    let formParam = getActionParam("form", cliData.actionParams!!);

    let appIdQueryParam = "";
    if (appParam && appParam.value) {
      appIdQueryParam = `appid=${appParam.value}&`;
    }

    let url = `${getCurrentOrgUrl()}/main.aspx?${appIdQueryParam}etn=${entityName}&pagetype=entityrecord`;
    openWindow(url, true);

    return getTextResponse(`New record for entity ${entityName} opened successfully!`);
  }
  catch (error) {
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`)
  }

}


const openView = (cliData: CliData) => {

  try {

    if (!cliData.actionParams)
      return getErrorResponse(`Need to provide atleast the entity param`);

    let entityParam = getActionParam("entity", cliData.actionParams!!);

    if (!entityParam || !entityParam.value)
      return getErrorResponse(`Please specify the entity to open the entity view.`);

    let entityName: string = entityParam.value;

    let appParam = getActionParam("app", cliData.actionParams!!);
    let viewParam = getActionParam("view", cliData.actionParams!!);
    let modeParam = getActionParam("mode", cliData.actionParams!!);

    let appIdQueryParam = "";
    let modeQueryParam = "";
    if (appParam && appParam.value) {
      appIdQueryParam = `appid=${appParam.value}&`;
    }
    else if (modeParam && modeParam.value) {
      modeQueryParam = (modeParam.value.toLowerCase() === "classic") ? "forceclassic=1&" : "forceUci=1&";
    }


    let viewIdQueryParam = "";
    if (viewParam && viewParam.value) {
      viewIdQueryParam = `viewid=%7b${viewParam.value}%7d&`;
    }

    let url = `${getCurrentOrgUrl()}/main.aspx?${modeQueryParam}${appIdQueryParam}${viewIdQueryParam}etn=${entityName}&pagetype=entitylist&viewtype=1039`;
    openWindow(url, true);

    return getTextResponse(`View for entity ${entityName} opened successfully!`);
  }
  catch (error) {
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`)
  }

}

const openEntity = async (cliData: CliData) => {
  try {


    let name = undefined;
    if (cliData.unnamedParam) {
      name = cliData.unnamedParam;
    }
    else {
      let actionParams = cliData.actionParams;
      if (actionParams) {
        let nameParam = getActionParam("name", actionParams);
        name = nameParam ? nameParam.value as string : undefined;
      }

    }

    if (!name)
      throw new Error("Please specify the name parameter and try again.");

    let retrieveMultipleRequest: any = {};
    retrieveMultipleRequest.collection = "solutions";
    retrieveMultipleRequest.select = ["solutionid"];
    retrieveMultipleRequest.filter = `uniquename eq 'Default'`;

    let retrieveResponse = await retrieveMultiple(retrieveMultipleRequest);
    let responseData: any = retrieveResponse.value;
    let solutionRecord = responseData[0];
    let solutionId = solutionRecord.solutionid;

    let entityMetadata = await getEntityMetadataBasic(name) as EntityMetadata;

    let otc = entityMetadata.ObjectTypeCode;

    let url = `${getCurrentOrgUrl()}/tools/solution/edit.aspx?def_category=9801&def_type=${otc}&id=${solutionId}`;
    openWindow(url, true);
    return getTextResponse(`Entity ${name} opened successfully!`);

  }
  catch (error) {
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }
}

async function handleOpenRecordAction(cliData: CliData): Promise<CliResponse> {
  try {
    let result = await getCRMRecord(cliData);
    let targetRecord = result.entityReference;

    if (targetRecord.logicalname === "solution") {
      let recordUrl = `${getCurrentOrgUrl()}/tools/solution/edit.aspx?id=${targetRecord.id}`;
      openWindow(recordUrl, true);
    }
    else if (targetRecord.logicalname === "webresource") {
      let recordUrl = `${getCurrentOrgUrl()}/main.aspx?etc=9333&pagetype=webresourceedit&id=${targetRecord.id}`;
      openWindow(recordUrl, true);
    }
    else {
      let mode = "UCI";//default
      if (cliData.actionParams) {
        let modeAP = getActionParam("mode", cliData.actionParams);
        if (modeAP && modeAP.value) {
          mode = modeAP.value;
        }
      }

      let appId = getAppId(cliData);
      openRecord(targetRecord, mode, appId);
    }



    return getTextResponse(
      `Record  ${targetRecord != null ? targetRecord.name : ""} with id ${targetRecord != null ? targetRecord.id : ""
      } opened successfully!`,
      targetRecord
    );
  } catch (error) {
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }
}


const getAppId = (cliData: CliData) => {

  if (!cliData.actionParams)
    return "";

  let appParam = getActionParam("app", cliData.actionParams);
  let appId = "";

  if (appParam && appParam.value) {
    appId = appParam.value;
  }

  return appId;
}

async function getCRMRecord(cliData: any) {
  let entityMetadata = await getEntityMetadataBasic(cliData.target);

  if (entityMetadata == null)
    throw new Error(
      "No entity found in crm that matches the Name. Please check the name and try again"
    );

  let entityFilter = getEntityFilter(entityMetadata, cliData);
  if (IsEmpty(entityFilter))
    throw new Error(
      "Please provide parameters for the record to filter the entity."
    );


  let retrieveMultipleRequest = {
    collection: entityMetadata.LogicalCollectionName === "webresources" ? "webresourceset" : entityMetadata.LogicalCollectionName,
    select: [
      entityMetadata.PrimaryIdAttribute,
      entityMetadata.PrimaryNameAttribute
    ],
    filter: entityFilter
  };

  let retrieveMultipleResponse = await retrieveMultiple(
    retrieveMultipleRequest
  );

  let results = await retrieveMultipleResponse.value;

  if (results == null || results.length === 0)
    throw new Error("No unique match found");

  if (results.length > 1)
    throw new Error(
      "Multiple records found. Please refine the criteria and try again"
    );

  let entity: any = results[0];

  return {
    entityReference: {
      id: entity[entityMetadata.PrimaryIdAttribute],
      logicalname: entityMetadata.LogicalName,
      name: entity[entityMetadata.PrimaryNameAttribute]
    }
  };
}

function getEntityFilter(entityMetadata: any, cliData: any) {
  if (IsEmpty(cliData.actionParams) && IsEmpty(cliData.unnamedParam))
    return null;


  let isValidId = isValidGuid(cliData.unnamedParam);
  if (isValidId) {
    return `${entityMetadata.PrimaryIdAttribute} eq ${cliData.unnamedParam}`;
  }


  if (!IsEmpty(cliData.unnamedParam))
    return (
      entityMetadata.PrimaryNameAttribute + " eq '" + cliData.unnamedParam + "'"
    );

  let entityFilters = Array<string>();
  cliData.actionParams.forEach((param: ActionParam) => {
    if (!IsEmpty(param.name) && !IsEmpty(param.value)) {
      if (param.name.toLowerCase() !== "mode" && param.name.toLowerCase() !== "app") {
        entityFilters.push(param.name + " eq '" + param.value + "'");
      }
    }
  });

  let entityFilter =
    entityFilters.length > 0 ? entityFilters.join(" and ") : null;
  return entityFilter;
}

function openRecord(entityreference: EntityReference, mode: string, appId: string) {
  const userUrl = getRecordUrl(entityreference.logicalname, entityreference.id, mode, appId);
  openWindow(userUrl, true);
}

function getRecordUrl(logicalName: string, id: string, mode: string, appId?: string) {
  const orgUrl = getCurrentOrgUrl();

  let uciParam = (mode && mode.toLowerCase() === "classic") ? "forceClassic=1&" : "";

  if (appId && appId !== "") {
    uciParam = `appid=${appId}&`;
  }
  const recordUrl = `${orgUrl}/main.aspx?${uciParam}etn=${logicalName}&pagetype=entityrecord&id=%7B${id}%7D`;
  return recordUrl;
}
