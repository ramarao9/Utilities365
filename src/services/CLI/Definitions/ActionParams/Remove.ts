import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_REMOVE_ROLE_NAME = "role";
export const ACTION_PARAM_REMOVE_USER_NAME = "user";


export const ACTION_PARAMS_REMOVE_ROLE: CLIVerb = { name: ACTION_PARAM_REMOVE_ROLE_NAME, type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_REMOVE_USER: CLIVerb = { name: ACTION_PARAM_REMOVE_USER_NAME, type: IntelliSenseType.ActionParams };


export const CLI_ACTION_PARAMS_REMOVE_ROLE: Array<CLIVerb> = [ACTION_PARAMS_REMOVE_ROLE,
                                                           ACTION_PARAMS_REMOVE_USER];