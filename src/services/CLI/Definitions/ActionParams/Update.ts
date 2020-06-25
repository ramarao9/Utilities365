import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_UPDATE_ID_NAME="id";
export const ACTION_PARAMS_UPDATE_ID: CLIVerb = { name: ACTION_PARAM_UPDATE_ID_NAME, type:IntelliSenseType.ActionParams, text:ACTION_PARAM_UPDATE_ID_NAME};

export const CLI_ACTION_PARAMS_UPDATE_RECORDS: Array<CLIVerb> = [ACTION_PARAMS_UPDATE_ID];