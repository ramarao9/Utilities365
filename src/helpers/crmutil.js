

export function getResource() {
    var resource = "https://ramajuly2018.crm.dynamics.com/";
    return resource;
}


export function isValidToken(token)
{
    return (token !== null && 
        token.accessToken!==null &&
        token.accessToken!==undefined);
}