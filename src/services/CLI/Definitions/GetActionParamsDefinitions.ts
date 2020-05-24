import { CLIVerb } from "../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_GET_FILTER_NAME="--filter";
export const ACTION_PARAM_GET_SELECT_NAME="--select";
export const ACTION_PARAM_GET_TOP_NAME="--top";


export const ACTION_PARAMS_GET_FILTER: CLIVerb = { name: ACTION_PARAM_GET_FILTER_NAME, description: "Provide the OData filter" };
export const ACTION_PARAMS_GET_SELECT: CLIVerb = { name: ACTION_PARAM_GET_SELECT_NAME, description: "CSV values of the attributes to be retrieved" };
export const ACTION_PARAMS_GET_TOP: CLIVerb = { name: ACTION_PARAM_GET_TOP_NAME, description: "Limits the number of results returned" };

export const CLI_ACTION_PARAMS_GET_RECORDS: Array<CLIVerb> = [ACTION_PARAMS_GET_FILTER,
    ACTION_PARAMS_GET_SELECT,
    ACTION_PARAMS_GET_TOP];