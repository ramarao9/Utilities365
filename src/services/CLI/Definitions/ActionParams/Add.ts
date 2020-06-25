import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_ADD_ROLE_NAME = "role";
export const ACTION_PARAM_ADD_USER_NAME = "user";


export const ACTION_PARAMS_ADD_ROLE: CLIVerb = { name: ACTION_PARAM_ADD_ROLE_NAME, type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ADD_USER: CLIVerb = { name: ACTION_PARAM_ADD_USER_NAME, type: IntelliSenseType.ActionParams };


export const CLI_ACTION_PARAMS_ADD_ROLE: Array<CLIVerb> = [ACTION_PARAMS_ADD_ROLE,
                                                           ACTION_PARAMS_ADD_USER];