import { retrieveMultiple } from "../helpers/webAPIClientHelper"
import { isValidGuid } from "../helpers/common"

export const getUser = async (user: string) => {

    let filter = "";
    if (isValidGuid(user)) {
        filter = `systemuserid eq ${user}`
    }
    else {
        filter = `internalemailaddress eq '${user}' or fullname eq '${user}' or domainname eq '${user}'`
    }

    var retrieveMultipleRequest = {
        collection: "systemusers",
        filter: filter,
        select: ["systemuserid","_businessunitid_value"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);

    let responseData = retrieveMultipleResp.value;
    if (responseData.length === 0) {
        throw new Error(`No user exists. Please check the user information and try again.`);
    }
    else if (responseData.length > 1) {
        throw new Error(`Multiple users found. Please provide the unique user information like Username, Id or EmailAddress and try again.`);
    }
    return responseData[0];
}