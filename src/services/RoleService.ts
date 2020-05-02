import { retrieveMultiple } from "../helpers/webAPIClientHelper"

export const getRoleId = async (roleName: string, businessUnitId: string) => {

    var retrieveMultipleRequest = {
        collection: "roles",
        filter: `name eq '${roleName}' and _businessunitid_value eq '${businessUnitId}'`,
        select: ["roleid"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);

    let responseData = retrieveMultipleResp.value;
    if (responseData.length === 0) {
        throw new Error(`No role with name ${roleName} exists. Please check the name and try again.`);
    }
    else if (responseData.length > 1) {
        throw new Error(`Multiple roles with the same name found. Please provide the role id instead and try again.`);
    }
    return responseData[0].roleid;

}
