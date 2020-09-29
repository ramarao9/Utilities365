import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";



export const ACTION_PARAM_ENTITY_NAME = "entity";
export const ACTION_PARAM_ATTRIBUTE_NAME = "attribute";
export const ACTION_PARAM_PROPERTIES_NAME = "properties";
export const ACTION_PARAM_FILTER_NAME = "filter";
export const ACTION_PARAM_FILTER_OPERATOR_NAME = "filteroperator"
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





export const ACTION_PARAM_ENTITIES_ENTITIES_NAME = "entities"
export const ACTION_PARAMS_ENTITIES_ENTITIES: CLIVerb = { name: ACTION_PARAM_ENTITIES_ENTITIES_NAME, description: "CSV of the entities", type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITIES_PROPERTIES: CLIVerb = { name: ACTION_PARAM_PROPERTIES_NAME, description: "CSV of the entity properties", type: IntelliSenseType.ActionParams };
export const ACTION_PARAMS_ENTITIES_FILTER: CLIVerb = { name: ACTION_PARAM_FILTER_NAME, description: "Specify the OData filter", type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_GET_ENTITIES: Array<CLIVerb> = [ACTION_PARAMS_ENTITIES_ENTITIES,
    ACTION_PARAMS_ENTITIES_FILTER,
    ACTION_PARAMS_ENTITIES_PROPERTIES];



export const GROUP_NAME_ODATA = "OData";
export const GROUP_NAME_FILTER_ATTRIBUTES = "Filter on Attributes";
export const ACTION_PARAM_GET_SELECT_NAME = "select";
export const ACTION_PARAM_GET_TOP_NAME = "top";
export const ACTION_PARAM_GET_ORDER_BY_NAME = "orderby";
export const ACTION_PARAM_GET_VIEW_NAME = "view";
export const ACTION_PARAMS_GET_FILTER: CLIVerb = { name: ACTION_PARAM_FILTER_NAME, description: "Provide the OData filter", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const ACTION_PARAMS_GET_LOGICAL_OPERATOR: CLIVerb = { name: ACTION_PARAM_FILTER_OPERATOR_NAME, description: "Specify the operator when using attributes", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const ACTION_PARAMS_GET_SELECT: CLIVerb = { name: ACTION_PARAM_GET_SELECT_NAME, description: "CSV of the attributes to be retrieved", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const ACTION_PARAMS_GET_TOP: CLIVerb = { name: ACTION_PARAM_GET_TOP_NAME, description: "Limits the number of results returned", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const ACTION_PARAMS_GET_ORDER_BY: CLIVerb = { name: ACTION_PARAM_GET_ORDER_BY_NAME, description: "Specify the order in which items are returned.", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const ACTION_PARAMS_GET_VIEW: CLIVerb = { name: ACTION_PARAM_GET_VIEW_NAME, description: "Specify the system or user view", type: IntelliSenseType.ActionParams, group: GROUP_NAME_ODATA, groupNumber: 1 };
export const CLI_ACTION_PARAMS_GET_RECORDS: Array<CLIVerb> = [ACTION_PARAMS_GET_FILTER,
    ACTION_PARAMS_GET_SELECT,
    ACTION_PARAMS_GET_TOP,
    ACTION_PARAMS_GET_LOGICAL_OPERATOR,
    ACTION_PARAMS_GET_ORDER_BY,
    ACTION_PARAMS_GET_VIEW];







//Common Operator Values
export const ACTION_PARAM_CONDITION_EQUALS = "eq";
export const ACTION_PARAM_CONDITION_DOES_NOT_EQUAL = "ne";
export const ACTION_PARAM_CONDITION_CONTAINS_DATA = "ne null";
export const ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_DATA = "eq null";

//String Operator Values
export const ACTION_PARAM_CONDITION_CONTAINS = "contains";
export const ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN = "not contains";
export const ACTION_PARAM_CONDITION_BEGINS_WITH = "startswith";
export const ACTION_PARAM_CONDITION_DOES_NOT_BEGIN_WITH = "not startswith";
export const ACTION_PARAM_CONDITION_ENDS_WITH = "endswith";
export const ACTION_PARAM_CONDITION_DOES_NOT_END_WITH = "not endswith";

//Numeric Operator Values
export const ACTION_PARAM_CONDITION_GREATER_THAN = "gt";
export const ACTION_PARAM_CONDITION_GREATER_THAN_OR_EQUAL = "ge";
export const ACTION_PARAM_CONDITION_LESS_THAN = "lt";
export const ACTION_PARAM_CONDITION_LESS_THAN_OR_EQUAL = "le";


export const STRING_CONDITION_OPERATORS = [
    ACTION_PARAM_CONDITION_EQUALS,
    ACTION_PARAM_CONDITION_DOES_NOT_EQUAL,
    ACTION_PARAM_CONDITION_CONTAINS,
    ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN,
    ACTION_PARAM_CONDITION_BEGINS_WITH,
    ACTION_PARAM_CONDITION_DOES_NOT_BEGIN_WITH,
    ACTION_PARAM_CONDITION_ENDS_WITH,
    ACTION_PARAM_CONDITION_DOES_NOT_END_WITH,
    ACTION_PARAM_CONDITION_CONTAINS_DATA,
    ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_DATA
];

//Common Display Names
export const ACTION_PARAM_CONDITION_EQUALS_NAME = "Equals";
export const ACTION_PARAM_CONDITION_DOES_NOT_EQUAL_NAME = "Does Not Equal";
export const ACTION_PARAM_CONDITION_CONTAINS_DATA_NAME = "Contains Data";
export const ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_DATA_NAME = "Does Not Contain Data";

//String Display Names
export const ACTION_PARAM_CONDITION_CONTAINS_NAME = "Contains";
export const ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_NAME = "Does Not Contain";
export const ACTION_PARAM_CONDITION_BEGINS_WITH_NAME = "Begins With";
export const ACTION_PARAM_CONDITION_DOES_NOT_BEGIN_WITH_NAME = "Does Not Begin With";
export const ACTION_PARAM_CONDITION_ENDS_WITH_NAME = "Ends With";
export const ACTION_PARAM_CONDITION_DOES_NOT_END_WITH_NAME = "Does Not End With";

//Numeric Display Names
export const ACTION_PARAM_CONDITION_GREATER_THAN_NAME = "Is Greater Than";
export const ACTION_PARAM_CONDITION_GREATER_THAN_OR_EQUAL_NAME = "Is Greater Than or Equal To";
export const ACTION_PARAM_CONDITION_LESS_THAN_NAME = "Is Less Than";
export const ACTION_PARAM_CONDITION_LESS_THAN_OR_EQUAL_NAME = "Is Less Than or Equal To";




export const GROUP_NAME_COMMON_OPERATORS = "commonoperators";
export const GROUP_NAME_STRING_OPERATORS = "stringoperators";
export const GROUP_NAME_NUMERIC_OPERATORS = "numericoperators";

//Common Operators Verbs

export const ACTION_PARAMS_GET_CONDITION_EQUALS: CLIVerb = {
    name: ACTION_PARAM_CONDITION_EQUALS_NAME,
    text: ACTION_PARAM_CONDITION_EQUALS,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_DOES_NOT_EQUAL: CLIVerb = {
    name: ACTION_PARAM_CONDITION_DOES_NOT_EQUAL_NAME,
    text: ACTION_PARAM_CONDITION_DOES_NOT_EQUAL,
    type: IntelliSenseType.ActionParamValue
};

export const ACTION_PARAMS_GET_CONDITION_CONTAINS_DATA: CLIVerb = {
    name: ACTION_PARAM_CONDITION_CONTAINS_DATA_NAME,
    text: ACTION_PARAM_CONDITION_CONTAINS_DATA,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET__CONDITION_DOES_NOT_CONTAIN_DATA: CLIVerb = {
    name: ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_DATA_NAME,
    text: ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_DATA,
    type: IntelliSenseType.ActionParamValue
};

//String Operators Verbs

export const ACTION_PARAMS_GET_CONDITION_CONTAINS: CLIVerb = {
    name: ACTION_PARAM_CONDITION_CONTAINS_NAME,
    text: ACTION_PARAM_CONDITION_CONTAINS,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_DOES_NOT_CONTAIN: CLIVerb = {
    name: ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN_NAME,
    text: ACTION_PARAM_CONDITION_DOES_NOT_CONTAIN,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_BEGINS_WITH: CLIVerb = {
    name: ACTION_PARAM_CONDITION_BEGINS_WITH_NAME,
    text: ACTION_PARAM_CONDITION_BEGINS_WITH,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_DOES_NOT_BEGIN_WITH: CLIVerb = {
    name: ACTION_PARAM_CONDITION_DOES_NOT_BEGIN_WITH_NAME,
    text: ACTION_PARAM_CONDITION_DOES_NOT_BEGIN_WITH,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_ENDS_WITH: CLIVerb = {
    name: ACTION_PARAM_CONDITION_ENDS_WITH_NAME,
    text: ACTION_PARAM_CONDITION_ENDS_WITH,
    type: IntelliSenseType.ActionParamValue
};
export const ACTION_PARAMS_GET_CONDITION_DOES_NOT_ENDS_WITH: CLIVerb = {
    name: ACTION_PARAM_CONDITION_DOES_NOT_END_WITH_NAME,
    text: ACTION_PARAM_CONDITION_DOES_NOT_END_WITH,
    type: IntelliSenseType.ActionParamValue
};


//Numeric Operator Verbs

export const ACTION_PARAMS_GET_CONDITION_IS_GREATER_THAN: CLIVerb = {
    name: ACTION_PARAM_CONDITION_GREATER_THAN_NAME,
    text: ACTION_PARAM_CONDITION_GREATER_THAN,
    type: IntelliSenseType.ActionParamValue
};


export const ACTION_PARAMS_GET_CONDITION_IS_GREATER_THAN_OR_EQUAL_TO: CLIVerb = {
    name: ACTION_PARAM_CONDITION_GREATER_THAN_OR_EQUAL_NAME,
    text: ACTION_PARAM_CONDITION_GREATER_THAN_OR_EQUAL,
    type: IntelliSenseType.ActionParamValue
};

export const ACTION_PARAMS_GET_CONDITION_IS_LESS_THAN: CLIVerb = {
    name: ACTION_PARAM_CONDITION_LESS_THAN_NAME,
    text: ACTION_PARAM_CONDITION_LESS_THAN,
    type: IntelliSenseType.ActionParamValue
};


export const ACTION_PARAMS_GET_CONDITION_IS_LESS_THAN_OR_EQUAL: CLIVerb = {
    name: ACTION_PARAM_CONDITION_LESS_THAN_OR_EQUAL_NAME,
    text: ACTION_PARAM_CONDITION_LESS_THAN_OR_EQUAL,
    type: IntelliSenseType.ActionParamValue
};


//Common
export const CLI_ACTION_PARAMS_GET_COMMON_CONDITIONS: Array<CLIVerb> = [
    ACTION_PARAMS_GET_CONDITION_EQUALS,
    ACTION_PARAMS_GET_CONDITION_DOES_NOT_EQUAL,
    ACTION_PARAMS_GET_CONDITION_CONTAINS_DATA,
    ACTION_PARAMS_GET__CONDITION_DOES_NOT_CONTAIN_DATA];

//String
export const CLI_ACTION_PARAMS_GET_STRING_CONDITIONS: Array<CLIVerb> = [
    ACTION_PARAMS_GET_CONDITION_CONTAINS,
    ACTION_PARAMS_GET_CONDITION_DOES_NOT_CONTAIN,
    ACTION_PARAMS_GET_CONDITION_BEGINS_WITH,
    ACTION_PARAMS_GET_CONDITION_DOES_NOT_BEGIN_WITH,
    ACTION_PARAMS_GET_CONDITION_ENDS_WITH,
    ACTION_PARAMS_GET_CONDITION_DOES_NOT_ENDS_WITH];


//Numeric
export const CLI_ACTION_PARAMS_GET_NUMERIC_CONDITIONS: Array<CLIVerb> = [
    ACTION_PARAMS_GET_CONDITION_IS_GREATER_THAN,
    ACTION_PARAMS_GET_CONDITION_IS_GREATER_THAN_OR_EQUAL_TO,
    ACTION_PARAMS_GET_CONDITION_IS_LESS_THAN,
    ACTION_PARAMS_GET_CONDITION_IS_LESS_THAN_OR_EQUAL
];