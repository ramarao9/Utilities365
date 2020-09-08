import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";



export const ACTION_PARAM_ENTITY_NAME = "entity";
export const ACTION_PARAM_ATTRIBUTE_NAME = "attribute";
export const ACTION_PARAM_PROPERTIES_NAME = "properties";
export const ACTION_PARAM_FILTER_NAME = "filter";
export const ACTION_PARAM_EXPAND_NAME = "expand";


export const ACTION_PARAM_ATTRIBUTE_ALL_NAME = "all";
export const ACTION_PARAM_ATTRIBUTE_ENTITY: CLIVerb = { name: ACTION_PARAM_ENTITY_NAME, type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTE_ATTRIBUTE: CLIVerb = { name: ACTION_PARAM_ATTRIBUTE_NAME, description: "Logical name of the attribute", type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTE_PROPERTIES: CLIVerb = { name: ACTION_PARAM_PROPERTIES_NAME, description: "CSV of the properties", type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTE_ALL: CLIVerb = { name: ACTION_PARAM_ATTRIBUTE_ALL_NAME, description: "Select this to return all properties", type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_GET_ATTRIBUTE: Array<CLIVerb> = [ACTION_PARAM_ATTRIBUTE_ENTITY,
    ACTION_PARAM_ATTRIBUTE_ATTRIBUTE,
    ACTION_PARAM_ATTRIBUTE_PROPERTIES,
    ACTION_PARAM_ATTRIBUTE_ALL];




export const ACTION_PARAM_ATTRIBUTES_TYPE_NAME = "type";
export const ACTION_PARAM_ATTRIBUTES_ENTITY: CLIVerb = { name: ACTION_PARAM_ENTITY_NAME, type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTES_TYPE: CLIVerb = { name: ACTION_PARAM_ATTRIBUTES_TYPE_NAME, description: "Proivde the attribute type", type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTES_PROPERTIES: CLIVerb = { name: ACTION_PARAM_PROPERTIES_NAME, description: "CSV of the properties", type: IntelliSenseType.ActionParams };
export const ACTION_PARAM_ATTRIBUTES_EXPAND: CLIVerb = { name: ACTION_PARAM_EXPAND_NAME, description: "Use to retrieve additional information", type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_GET_ATTRIBUTES: Array<CLIVerb> = [ACTION_PARAM_ATTRIBUTES_ENTITY,
    ACTION_PARAM_ATTRIBUTES_TYPE,
    ACTION_PARAM_ATTRIBUTES_PROPERTIES,
    ACTION_PARAM_ATTRIBUTES_EXPAND];



export const ACTION_PARAMS_ENTITY_ENTITY: CLIVerb = { name: ACTION_PARAM_ENTITY_NAME, type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITY_PROPERTIES: CLIVerb = { name: ACTION_PARAM_PROPERTIES_NAME, description: "CSV of the entity properties", type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITY_EXPAND: CLIVerb = { name: ACTION_PARAM_EXPAND_NAME, description: "Specify the relationships", type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_GET_ENTITY: Array<CLIVerb> = [ACTION_PARAMS_ENTITY_ENTITY,
    ACTION_PARAMS_ENTITY_PROPERTIES,
    ACTION_PARAMS_ENTITY_EXPAND];





export const ACTION_PARAM_ENTITIES_ENTITIES_NAME="entities"
export const ACTION_PARAMS_ENTITIES_ENTITIES: CLIVerb = { name: ACTION_PARAM_ENTITIES_ENTITIES_NAME, description: "CSV of the entities", type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITIES_PROPERTIES: CLIVerb = { name: ACTION_PARAM_PROPERTIES_NAME, description: "CSV of the entity properties", type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITIES_FILTER: CLIVerb = { name: ACTION_PARAM_FILTER_NAME, description: "Specify the OData filter", type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_GET_ENTITIES: Array<CLIVerb> = [ACTION_PARAMS_ENTITIES_ENTITIES,
    ACTION_PARAMS_ENTITIES_FILTER,
    ACTION_PARAMS_ENTITIES_PROPERTIES];



export const GROUP_NAME_ODATA="OData";
export const GROUP_NAME_FILTER_ATTRIBUTES="Filter on Attributes";
export const ACTION_PARAM_GET_SELECT_NAME = "select";
export const ACTION_PARAM_GET_TOP_NAME = "top";
export const ACTION_PARAM_GET_ORDER_BY_NAME = "orderby";
export const ACTION_PARAM_GET_VIEW_NAME = "view";
export const ACTION_PARAMS_GET_FILTER: CLIVerb = { name: ACTION_PARAM_FILTER_NAME, description: "Provide the OData filter", type: IntelliSenseType.ActionParams, group:GROUP_NAME_ODATA,groupNumber:1};
export const ACTION_PARAMS_GET_SELECT: CLIVerb = { name: ACTION_PARAM_GET_SELECT_NAME, description: "CSV of the attributes to be retrieved", type: IntelliSenseType.ActionParams, group:GROUP_NAME_ODATA,groupNumber:1 };
export const ACTION_PARAMS_GET_TOP: CLIVerb = { name: ACTION_PARAM_GET_TOP_NAME, description: "Limits the number of results returned", type: IntelliSenseType.ActionParams, group:GROUP_NAME_ODATA,groupNumber:1 };
export const ACTION_PARAMS_GET_ORDER_BY: CLIVerb = { name: ACTION_PARAM_GET_ORDER_BY_NAME, description: "Specify the order in which items are returned.", type: IntelliSenseType.ActionParams, group:GROUP_NAME_ODATA,groupNumber:1 };
export const ACTION_PARAMS_GET_VIEW: CLIVerb = { name: ACTION_PARAM_GET_VIEW_NAME, description: "Specify the system or user view", type: IntelliSenseType.ActionParams, group:GROUP_NAME_ODATA,groupNumber:1 };
export const CLI_ACTION_PARAMS_GET_RECORDS: Array<CLIVerb> = [ACTION_PARAMS_GET_FILTER,
    ACTION_PARAMS_GET_SELECT,
    ACTION_PARAMS_GET_TOP,
    ACTION_PARAMS_GET_ORDER_BY,
    ACTION_PARAMS_GET_VIEW];






