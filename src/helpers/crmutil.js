
export function isValidToken(token) {
    return (token !== null &&
        token.accessToken !== null &&
        token.accessToken !== undefined);
}

export function getOrgInfo() {

    var orgInfo = {
        clientId: getClientId(),
        authorityUri: getAuthorityUri(),
        orgUrl: getOrgUrl(),
        redirectUri: getRedirectUri()
    }


    return orgInfo;
}

export function getClientId() {
    return "941501b6-4bf0-4f3e-b6ed-658c0a560a8c";
}
export function getAuthorityUri() {
    var authUrl = "https://login.microsoftonline.com/a60f8a6c-4efd-4e18-8dc8-698195f503e3/oauth2/authorize";
    return authUrl;
}

export function getOrgUrl() {
    var resource = "https://ramafebruary2019.crm.dynamics.com/";
    return resource;
}

export function getRedirectUri() {

    const redirectUri = "https://google.com";
    return redirectUri;
}