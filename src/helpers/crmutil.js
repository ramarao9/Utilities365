

export function getResource() {
    var resource = "https://ramajuly2018.crm.dynamics.com/";
    return resource;
}


export function isValidToken(token)
{
    return (token !== null && 
        token.access_token!==null &&
        token.access_token!==undefined);
}