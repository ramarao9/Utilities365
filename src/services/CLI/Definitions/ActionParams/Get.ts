import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";


export const ACTION_PARAM_ENTITY_ENTITY_NAME="entity";
export const ACTION_PARAM_ENTITY_PROPERTIES_NAME="properties";
export const ACTION_PARAM_ENTITY_EXPAND_NAME="expand";

export const ACTION_PARAMS_ENTITY_ENTITY: CLIVerb = { name: ACTION_PARAM_ENTITY_ENTITY_NAME,  type:IntelliSenseType.ActionParams};
export const ACTION_PARAMS_ENTITY_PROPERTIES: CLIVerb = { name: ACTION_PARAM_ENTITY_PROPERTIES_NAME, description: "CSV of the entity properties",type:IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITY_EXPAND: CLIVerb = { name: ACTION_PARAM_ENTITY_EXPAND_NAME, description: "Specify the relationships",type:IntelliSenseType.ActionParams };

export const CLI_ACTION_PARAMS_GET_ENTITY: Array<CLIVerb> = [ACTION_PARAMS_ENTITY_ENTITY,
    ACTION_PARAMS_ENTITY_PROPERTIES,
    ACTION_PARAMS_ENTITY_EXPAND];


export const ACTION_PARAM_GET_FILTER_NAME="filter";
export const ACTION_PARAM_GET_SELECT_NAME="select";
export const ACTION_PARAM_GET_TOP_NAME="top";
export const ACTION_PARAM_GET_ORDER_BY_NAME="orderby";

export const ACTION_PARAMS_GET_FILTER: CLIVerb = { name: ACTION_PARAM_GET_FILTER_NAME, description: "Provide the OData filter" , type:IntelliSenseType.ActionParams};
export const ACTION_PARAMS_GET_SELECT: CLIVerb = { name: ACTION_PARAM_GET_SELECT_NAME, description: "CSV of the attributes to be retrieved",type:IntelliSenseType.ActionParams };
export const ACTION_PARAMS_GET_TOP: CLIVerb = { name: ACTION_PARAM_GET_TOP_NAME, description: "Limits the number of results returned",type:IntelliSenseType.ActionParams };
export const ACTION_PARAMS_GET_ORDER_BY: CLIVerb = { name: ACTION_PARAM_GET_ORDER_BY_NAME, description: "Specify the order in which items are returned.",type:IntelliSenseType.ActionParams };

export const CLI_ACTION_PARAMS_GET_RECORDS: Array<CLIVerb> = [ACTION_PARAMS_GET_FILTER,
    ACTION_PARAMS_GET_SELECT,
    ACTION_PARAMS_GET_TOP,
    ACTION_PARAMS_GET_ORDER_BY];






