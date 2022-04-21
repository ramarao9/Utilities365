import { CliResponseType } from "../interfaces/CliResponse";
import { WEB_API_VERSION } from "../resources/strings";
import { getCurrentOrgUrl } from "./webAPIClientHelper";


export function isValidToken(token: any) {
  return (
    token &&
    token.accessToken
  );
}


export function getAuthorizationEndpoint(tenantId: string) {
  let authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/authorize`;
  return authUrl;
}
export function getCliResponse(type: CliResponseType, message: string, response: any, success: boolean) {
  var cliResponse = {
    type: type,
    response: response,
    message: message,
    success: success
  };


  return cliResponse;
}


export const getRecordUrl = (logicalName: string, id: string): string => {
  let orgUrl = getCurrentOrgUrl();
  return `${orgUrl}/main.aspx?etn=${logicalName}&id=${id}&pagetype=entityrecord`;
}

export const getOdataUrl = (entitySetName: string, id: string): string => {
  let orgUrl = getCurrentOrgUrl();


  return `${orgUrl}/api/data/v${WEB_API_VERSION}/${entitySetName}/(${id})`;
}



export function getCliErrorResponse(error: string) {
  return getCliResponse(CliResponseType.Error, error, null, false);
}



