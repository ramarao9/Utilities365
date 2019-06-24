import IsEmpty from "is-empty";
import { getEntityMetadata } from "../../CrmMetadataService";
import { retrieveMultiple } from "../../../helpers/webAPIClientHelper";

import { getErrorResponse, getTextResponse } from "../CliResponse";
import { getCurrentOrgUrl } from "../../../helpers/webAPIClientHelper";
import { openWindow } from "../../../helpers/util";

import {
  STR_NO_RECORDS_FOUND_FOR_CRITERIA,
  STR_ERROR_OCCURRED,
  STR_ONE_OR_MORE_RECORDS_FOUND_FOR_CRITERIA
} from "../../../helpers/strings";

export const handleCrmOpenActions = async cliData => {
  let cliResponse = null;

  const target = cliData.target;

  switch (target.toLowerCase().trim()) {


    case "advfind":
    case "advancedfind":
    case "search":
      break;

    //Default is opening the entity record using the params
    default:
      cliResponse = await handleOpenRecordAction(cliData);
      break;
  }

  return cliResponse;
};

async function handleOpenRecordAction(cliData, onactionCompleteCallback) {
  try {
    let result = await getCRMRecord(cliData);
    let targetRecord = result.entityReference;

    openRecord(targetRecord);

    return getTextResponse(
      `Record  ${targetRecord.name} with id ${
        targetRecord.id
      } opened successfully!`
    );
  } catch (error) {

    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }
}



 async function getCRMRecord(cliData) {

    
  let entityMetadata = await getEntityMetadata(cliData.target);

  if (entityMetadata == null)
    throw new Error("No entity found in crm that matches the Name. Please check the name and try again");

  let entityFilter = getEntityFilter(entityMetadata, cliData);
  if (IsEmpty(entityFilter))
    throw new Error("Please provide parameters for the record to filter the entity.");

  let retrieveMultipleRequest = {
    collection: entityMetadata.LogicalCollectionName,
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

  if (results == null || results.length === 0) throw new Error("No match found");

  if (results.length > 1)
    throw new Error("Multiple records found. Please refine the criteria and try again");

  let entity = results[0];

  return {
    entityReference: {
      id: entity[entityMetadata.PrimaryIdAttribute],
      logicalname: entityMetadata.LogicalName,
      name: entity[entityMetadata.PrimaryNameAttribute]
    }
  };
}

function getEntityFilter(entityMetadata, cliData) {


  if (IsEmpty(cliData.actionParams) && IsEmpty(cliData.unnamedParam))
    return null;

  if (!IsEmpty(cliData.unnamedParam))
    return (
      entityMetadata.PrimaryNameAttribute + " eq '" + cliData.unnamedParam + "'"
    );

  let entityFilters = [];
  cliData.actionParams.forEach(param => {
    if (!IsEmpty(param.name) && !IsEmpty(param.value)) {
      entityFilters.push(param.name + " eq '" + param.value + "'");
    }
  });

  let entityFilter =
    entityFilters.length > 0 ? entityFilters.join(" and ") : null;
  return entityFilter;
}



function openRecord(entityreference) {
  const userUrl = getRecordUrl(entityreference.logicalname, entityreference.id);
  openWindow(userUrl, true);
}

function getRecordUrl(logicalName, id) {
  const orgUrl = getCurrentOrgUrl();
  const recordUrl =
    orgUrl +
    "/main.aspx?etn=" +
    logicalName +
    "&pagetype=entityrecord&id=%7B" +
    id +
    "%7D";
  return recordUrl;
}
