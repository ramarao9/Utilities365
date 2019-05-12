export function isValidToken(token) {
  return (
    token !== null &&
    token.accessToken !== null &&
    token.accessToken !== undefined
  );
}

export function getAuthorizationEndpoint(tenantId) {
  let authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/authorize`;
  return authUrl;
}

export function getCliResponse(type, response, success, error) {
  var cliResponse = {
    type: type,
    response: response,
    message: error,
    success: false
  };

  if (success != null) {
    cliResponse.success = success;
  }

  return cliResponse;
}


export function getCliErrorResponse(error) {
return getCliResponse(null, null, false, error);

}