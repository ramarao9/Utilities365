
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
    return "6a5a53d4-dfaa-45e9-9169-52fa741b3aff";
}
export function getAuthorityUri() {
    var authUrl = "https://login.microsoftonline.com/a15f71fd-1edd-4470-8c04-99353bc8c28b/oauth2/authorize";
    return authUrl;
}

export function getOrgUrl() {
    var resource = "https://ramanovember2018.crm.dynamics.com/";
    return resource;
}

export function getRedirectUri() {

    const redirectUri = "https://google.com";
    return redirectUri;
}