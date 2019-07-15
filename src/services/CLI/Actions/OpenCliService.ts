import IsEmpty from "is-empty";
import { handleCrmOpenUserActions } from "../User/CrmOpenUserService";
import { getCRMRecord } from "../CrmOpenRecordService";
import { getCurrentOrgUrl } from "../../../helpers/webAPIClientHelper";
import { openWindow } from "../../../helpers/util";
import { getCliResponse } from "../../../helpers/crmutil";
import { CliResponse } from "../../../interfaces/CliResponse";
import {
  STR_NO_RECORDS_FOUND_FOR_CRITERIA,
  STR_ERROR_OCCURRED,
  STR_ONE_OR_MORE_RECORDS_FOUND_FOR_CRITERIA
} from "../../../helpers/strings";

export const handleCrmOpenActions = async (cliData:any) :Promise<CliResponse> => {
    let cliResponse: CliResponse = {
    message: "",
    success: false,
    response: null
  };

  const target = cliData.target;

  if (IsEmpty(target)) {
    return getCliResponse(
      "message",
      null,
      "false",
      `Unable to determine the target on which ${
        cliData.action
      } needs to be performed`
    );

    return cliResponse;
  }

  switch (target.toLowerCase().trim()) {
    case "myuser":
    case "systemuser":
    case "user":
      cliResponse = await handleCrmOpenUserActions(cliData);
      break;

    case "advfind":
    case "advancedfind":
    case "search":
      break;

    //Default is opening the entity record using the params
    default:
     cliResponse = await handleOpenRecordAction(cliData);
      break;
  }

  if (cliResponse.success) {
    openRecord(cliResponse.response);
  }

  return cliResponse;
};

async function handleOpenRecordAction(cliData : any) {
  try {
    let result = await getCRMRecord(cliData);
    let targetRecord = result.entityReference;

     return getCliResponse(
      "open",
      targetRecord,
      true,
      `Record  ${ (targetRecord!=null)?targetRecord.name:""} with id ${(targetRecord!=null)?targetRecord.id :""} opened successfully!`
    );
  } catch (error) {
       return getCliResponse(
      "open",
      null,
      false,
     `${STR_ERROR_OCCURRED} ${error.message}`);
  }
}

function openRecord(entityreference : any) {
  const userUrl = getRecordUrl(entityreference.logicalname, entityreference.id);
  openWindow(userUrl, true);
}

function getRecordUrl(logicalName:any, id: any)  {
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
