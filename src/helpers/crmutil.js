import CliResponse from '../interfaces/CliResponse';

export function isValidToken(token) {
  return (
    token != null &&
    token.accessToken !== null &&
    token.accessToken !== undefined
  );
}
 

export function getAuthorizationEndpoint(tenantId) {
  let authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/authorize`;
  return authUrl;
}

export function getCliResponse(type,message, response, success) {
  var cliResponse = {
    type: type,
    response: response,
    message: message,
    success: false
  };

  if (success != null) {
    cliResponse.success = success;
  }

  return cliResponse;
}

export const getRecordUrl = (orgUrl, logicalName, id) => {
  return `${orgUrl}/main.aspx?etn=${logicalName}&id=${id}&pagetype=entityrecord`;
};

export function getCliErrorResponse(error) {
  return getCliResponse("error",error,null, false);
}
