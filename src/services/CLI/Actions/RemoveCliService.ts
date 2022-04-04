import { CliData } from "../../../interfaces/CliData"
import { CliResponse, CliResponseType } from "../../../interfaces/CliResponse"
import { getErrorResponse } from "../CliResponseUtil";
import { disassociate } from "../../../helpers/webAPIClientHelper"
import { getUser } from "../../SystemUserService";
import { getRoleId } from "../../RoleService";
import {
    STR_ERROR_OCCURRED
} from "../../../helpers/strings";

import {
     getActionParam,
} from "../../../helpers/QueryHelper";


export const handleCrmRemoveActions = async (cliData: CliData) => {
    let cliResponse: CliResponse = { message: "", success: false, type: CliResponseType.None };

    try {

     
        switch (cliData.target.toLowerCase()) {
            case "role": await removeRoleFromUser(cliData);
                cliResponse.message = `Role removed successfully from user`;
                break;
        }


        cliResponse.success = true;
    }
    catch (error : any) {
        console.log(error);
        return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
    }


    return cliResponse;
};



const removeRoleFromUser = async (cliData: CliData) => {


    let actionParams = cliData.actionParams;
    if (actionParams == null)
        throw new Error("Please specify the parameters and try again. User and Role parameter must be provided.");

    let userParam = getActionParam("user", actionParams);
    let roleParam = getActionParam("role", actionParams);


    if (!userParam || !userParam.value)
        throw new Error(`User parameter cannot be empty. Please provide the parameter and try again`);

    if (!roleParam || !roleParam.value)
        throw new Error(`Role parameter cannot be empty. Please provide the parameter and try again`);

    let user = userParam.value;
    let role = roleParam.value;



    let systemuser:any = await getUser(user);
    let roleId = await getRoleId(role,systemuser._businessunitid_value);


    await disassociate("roles", roleId, "systemuserroles_association", systemuser.systemuserid);

}

