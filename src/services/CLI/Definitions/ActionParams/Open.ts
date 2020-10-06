import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";
import { GROUP_NAME_OPEN_DEFAULT } from "../Target/Open";


export const ACTION_PARAM_OPEN_NAME="name";
export const ACTION_PARAMS_OPEN_NAME: CLIVerb = { name: ACTION_PARAM_OPEN_NAME,  type:IntelliSenseType.ActionParams};
export const CLI_ACTION_PARAMS_OPEN_GENERIC: Array<CLIVerb> = [ACTION_PARAMS_OPEN_NAME];




export const ACTION_PARAM_OPEN_RECORD_MODE="mode";
export const ACTION_PARAM_OPEN_RECORD_MODE_NAME: CLIVerb = { name: ACTION_PARAM_OPEN_RECORD_MODE,
      type:IntelliSenseType.ActionParams,group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1};
export const CLI_ACTION_PARAMS_OPEN_RECORD: Array<CLIVerb> = [ACTION_PARAM_OPEN_RECORD_MODE_NAME];