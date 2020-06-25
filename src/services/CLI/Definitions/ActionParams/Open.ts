import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_OPEN_NAME="name";
export const ACTION_PARAMS_OPEN_NAME: CLIVerb = { name: ACTION_PARAM_OPEN_NAME,  type:IntelliSenseType.ActionParams};
export const CLI_ACTION_PARAMS_OPEN_ENTITY: Array<CLIVerb> = [ACTION_PARAMS_OPEN_NAME];