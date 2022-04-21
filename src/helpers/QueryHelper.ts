import { Option, EntityMetadata, AttributeMetadata } from "../interfaces/EntityMetadata";
import { ActionParam } from "../interfaces/CliData"
import { expand } from "../interfaces/expand";
import { getArrayFromCSV, getAttributeMetadataName, getFirstLabelFromLocalizedLabels } from "../helpers/common";
import { QueryFunction } from "../interfaces/QueryFunction";
import { CONDITION_OPERATORS, REGULAR_CONDITION_OPERATORS, STANDARD_QUERY_FUNCTION_CONDITION_OPERATORS } from "../services/CLI/Definitions/ActionParams/Get";
import { ConditionOperatorType } from "../interfaces/ConditionOperatorType";
import { getEntity } from "../services/CrmMetadataService";

export const getTypeQueryParam = (typeParam: ActionParam | undefined): string | undefined => {

    let type = typeParam ? typeParam.value as string : undefined;
    if (type) {
        if (!type.startsWith("Microsoft.Dynamics.CRM.") && !type.endsWith("AttributeMetadata")) {
            let attributeMetadataName = getAttributeMetadataName(type);
            type = `Microsoft.Dynamics.CRM.${attributeMetadataName}AttributeMetadata`;
        }
    }
    return type;
}

export const getExpandQueryParam = (expandParam: ActionParam | undefined, type: string | undefined): Array<expand> => {
    let expandArr: expand[] = Array<expand>();
    if (expandParam) {
        let expandAtts = expandParam ? getArrayFromCSV(expandParam.value) : undefined;
        if (expandAtts && expandAtts.length > 0) {
            expandArr = expandAtts.map((val: string, index: number, arr: string[]) => {
                let expandProp: expand = { property: val };
                return expandProp;
            });
        }
    }
    else if (type && (type.indexOf("Picklist") !== -1 || type.indexOf("State") !== -1)) {
        let expandObj: expand = { property: "OptionSet" };
        expandArr.push(expandObj);
    }
    return expandArr
}


export const getAlternateKey = (keyVal: string): string => {
    keyVal = keyVal.trim();
    return `LogicalName='${keyVal}'`;
}


export const hasActionParamVal = (name: string, actionParams: Array<ActionParam> | undefined): boolean => {

    if (!actionParams)
        return false;

    let matchedActionParam = actionParams.find(x => x.value && x.value.toLowerCase().trim() === name.trim().toLowerCase());
    return (matchedActionParam !== undefined);

}

export const getActionParam = (parameterName: string, actionParams: Array<ActionParam> | undefined): ActionParam | undefined => {
    if (!actionParams)
        return undefined;

    let match: ActionParam = actionParams.find(x => x.name != null && x.name.toLowerCase().trim() === parameterName.trim().toLowerCase()) as ActionParam;
    return match;
}


export const getPrimaryIdAttribute = (collectionName: string): string => {


    if (collectionName == null)
        return "";

    return `${collectionName.slice(0, -1).toLowerCase()}id`;

}


//Returns the filter by adding additional conditions when --attributes is provided on the Get Attributes command
export const getFilterWhenAttributes = (attributes: string, existingFilter: string | undefined): string | undefined => {
    let attributesArr = getArrayFromCSV(attributes);
    if (!attributesArr || attributesArr.length === 0)
        return existingFilter;


    let filterToAppend = attributesArr.reduce((prev: string, curr: string, int: number, arr: Array<string>): string => {
        return prev + `LogicalName eq '${curr}' or `;
    }, "");

    filterToAppend = filterToAppend.slice(0, -4);
    if (existingFilter) {
        existingFilter += ` and ${filterToAppend}`;
    }
    else {
        return filterToAppend;
    }


}



export const getOptionSetLabelValues = (options: Array<Option>): string => {

    let optionSetLabelValues = options.reduce((prevValue: string | undefined, currValue: Option, currentIndex: number, arr: Option[]): string => {

        let label = currValue.Label && currValue.Label.LocalizedLabels ? getFirstLabelFromLocalizedLabels(currValue.Label.LocalizedLabels) : "";

        let labelValue = `Value: ${currValue.Value}, Label: ${label}`;
        if (prevValue) {
            let optionSetData = `${prevValue}
${labelValue}`;
            return optionSetData;
        }
        else {
            return labelValue;
        }




    }, undefined);

    if (!optionSetLabelValues) {
        return "";
    }

    return optionSetLabelValues;


}

export const buildFilterUsingAttributeParams = async (entitymetadata: EntityMetadata, actionParams: Array<ActionParam>): Promise<string> => {

    let attributes = entitymetadata.Attributes;

    if (attributes == null) {
        let entity = await getEntity(entitymetadata.LogicalName);
        attributes = entity?.Attributes
    }


    let filterOperator = getFilterOperator(actionParams);
    let filter: string = actionParams.reduce((acc: string, x: ActionParam, currentIndex: number): string => {
        let attributeLogicalName = x.name.toLowerCase();
        let attributeMetadata = attributes ? attributes.find(x => x.LogicalName === attributeLogicalName) : null;
        if (attributeMetadata && x.value) {
            let odataCondition = getODataCondition(x.value, attributeMetadata);


            let operator = currentIndex === 0 ? "" : filterOperator;
            if (odataCondition) {
                acc += ` ${operator} ${odataCondition}`;
            }
        }

        return acc;
    }, "");


    return filter.trim();
}


const getFilterOperator = (actionParams: Array<ActionParam>) => {
    let filterOperatorParam = getActionParam("filterOperator", actionParams);
    let operatorToUse = filterOperatorParam && filterOperatorParam.value ? filterOperatorParam.value : "and";
    return operatorToUse;
}

export const getODataCondition = (attQueryInfo: string, attributeMetadata: AttributeMetadata): string | undefined => {

    let attValue = getAttValueFromAttQueryInfo(attQueryInfo);
    let conditionOperator = attQueryInfo.toLowerCase().replace(attValue, '').trim();

    if (attributeMetadata.AttributeType === "DateTime" && conditionOperator === "") {
        conditionOperator = "on";
    }
    else if (conditionOperator === "") {
        conditionOperator = "eq";
    }

    let attValueOnFilter = getAttributeValueOnODataFilter(attValue, attributeMetadata);


    let oDataCondition: string = '';
    let conditionOperatorType = getConditionOperatorType(conditionOperator);
    switch (conditionOperatorType) {


        case ConditionOperatorType.StandardQueryFunction:
            oDataCondition = `${conditionOperator}(${attributeMetadata.LogicalName},${attValueOnFilter})`;
            break;


        case ConditionOperatorType.Regular:
            oDataCondition = `${attributeMetadata.LogicalName} ${conditionOperator} ${attValueOnFilter}`;
            break;

        case ConditionOperatorType.QueryFunction:
            oDataCondition = getConditionWhenQueryFunction(attributeMetadata, conditionOperator, attValue);
            break;

    }


    return oDataCondition.trim();

}


export const getConditionWhenQueryFunction = (attributeMetadata: AttributeMetadata,
    queryFunction: string, attValue: string): string => {

    let functionDefinition = getFunctionDefinitionCaseInsensitive(queryFunction);
    let formattedCondition = functionDefinition.DeclarationTemplate;

    let propertyName = `'${attributeMetadata.LogicalName}'`;
    formattedCondition = formattedCondition.replace("@p1", propertyName);//p1 is always going to be the PropertyName/LogicalName

    let totalPropertyValuesOnFunction = functionDefinition.Parameters.filter(x => x.Name.startsWith("PropertyValue")).length;

    let functionParams = attValue.split("|");
    for (var i = 0; i < totalPropertyValuesOnFunction; i++) {
        let parameterType = functionDefinition.Parameters[i + 1].Type;
        let parameterValue = functionParams[i];

        let parsedParamValue = parseParamValueByType(parameterType, parameterValue);
        formattedCondition = formattedCondition.replace(`@p${i + 2}`, parsedParamValue);
    }
    return formattedCondition;
}


export const parseParamValueByType = (parameterType: string, parameterValue: string): string => {
    let parsedParamValue = "";

    switch (parameterType) {

        case "Collection(Edm.String)": parsedParamValue = `[${parameterValue.replace(/"/g, "'")}]`;
            break;

        case "Edm.Int64": parsedParamValue = replaceQuotes(parameterValue);
            break;

        case "Edm.String": parsedParamValue = replaceQuotes(parameterValue);
            parsedParamValue = `'${parsedParamValue}'`;
            break;
    }

    return parsedParamValue;
}

export const getFunctionDefinitionCaseInsensitive = (queryFunction: string): QueryFunction => {
    let queryFunctions = getAvailableQueryFunctionNames();

    let matchedQueryFunctionByCase = queryFunctions.filter(x => x.toLowerCase() === queryFunction.toLowerCase());

    //When the QueryFunction is invalid, 
    if (!matchedQueryFunctionByCase || matchedQueryFunctionByCase.length !== 1)
        throw new Error(`Unrecognized query function. Please check the name and try again.`);

    let queryFunctionProperCase = matchedQueryFunctionByCase[0];

    let functionDefinition = getFunctionDefinition(queryFunctionProperCase);
    return functionDefinition!!;
}

export const getConditionOperatorType = (conditionOperator: string): ConditionOperatorType => {

    if (REGULAR_CONDITION_OPERATORS.indexOf(conditionOperator.toLowerCase()) !== -1) {
        return ConditionOperatorType.Regular;
    }
    else if (STANDARD_QUERY_FUNCTION_CONDITION_OPERATORS.indexOf(conditionOperator.toLowerCase()) !== -1)
        return ConditionOperatorType.StandardQueryFunction;
    else
        return ConditionOperatorType.QueryFunction;
}

//attQueryInfo is an Action Param Value which is in the format of '{condition operator} {att value}'
export const getAttValueFromAttQueryInfo = (attQueryInfo: string) => {

    let sortedConditionOperators = CONDITION_OPERATORS.sort(function (a, b) {
        return b.length - a.length;//Desc
    });

    let operatorsRegular = ["eq", "ne", "gt", "lt", "on", "ge", "le"]
    sortedConditionOperators.forEach(x => {
        if (operatorsRegular.indexOf(x.toLowerCase()) === -1) {
            attQueryInfo = attQueryInfo.toLowerCase().replace(x.toLowerCase(), '');
        }
    });

    operatorsRegular.forEach(x => {
        if (attQueryInfo.toLowerCase().startsWith(`${x} `)) {
            attQueryInfo = attQueryInfo.toLowerCase().replace(`${x} `, '');
        }
    });


    return attQueryInfo.trim();
}

const getAttributeValueOnODataFilter = (attValue: string, attributeMetadata: AttributeMetadata): string | undefined => {

    if (attValue === "")
        return attValue;

    let valueToUseForFilter = undefined;
    switch (attributeMetadata.AttributeType) {

        case "EntityName":
        case "Memo":
        case "String": valueToUseForFilter = `'${attValue}'`;
            break;

        case "Money":
        case "DateTime":
        case "Boolean":
        case "Picklist":
        case "Lookup":
        case "Uniqueidentifier":
        case "Integer": valueToUseForFilter = `${attValue}`;
            break;



    }


    return valueToUseForFilter;

}

export const parseQueryFunctionInFilterIfAny = (filter: string): string => {

    let parsedFilter = filter;
    let queryFunctions = getQueryFunctionMetadataList();

    let runningFilterLowerCase = filter.toLowerCase();
    queryFunctions.forEach(queryFunction => {

        let functionNameLC = queryFunction.Name.toLowerCase();

        while (runningFilterLowerCase.indexOf(functionNameLC + "(") !== -1) {

            let indexOfCurrentFunction = runningFilterLowerCase.indexOf(functionNameLC);
            let substrFromCurrentFunctionIndex = parsedFilter.substr(indexOfCurrentFunction);
            let indexOfFunctionClosingBracket = substrFromCurrentFunctionIndex.indexOf(")");


            let queryFuncData = substrFromCurrentFunctionIndex.substr(0, indexOfFunctionClosingBracket + 1);
            let indexOfFuncStartBracket = queryFuncData.indexOf("(");
            let funcParamInfo = queryFuncData.substr(indexOfFuncStartBracket).replace("(", "").replace(")", "");
            let functionParams = (funcParamInfo !== "") ? funcParamInfo.split(",") : [];

            let formattedFunctionDeclaration = queryFunction.DeclarationTemplate;
            if (functionParams.length > 0) {
                let propertyName = `'${functionParams[0].replace(/'/g, '').replace(/"/g, '')}'`;
                functionParams.shift();



                formattedFunctionDeclaration = formattedFunctionDeclaration.replace("@p1", propertyName);
                if (functionParams && functionParams.length > 0) {
                    let parameterType = queryFunction.Parameters[1].Type;
                    let parameterValue = functionParams[0];
                    switch (parameterType) {

                        case "Collection(Edm.String)": parameterValue = parameterValue.replace(/"/g, "'");
                            break;

                        case "Edm.Int64": parameterValue = replaceQuotes(parameterValue);
                            break;

                        case "Edm.String": parameterValue = replaceQuotes(parameterValue);
                            parameterValue = `'${parameterValue}'`;
                            break;
                    }

                    formattedFunctionDeclaration = formattedFunctionDeclaration.replace("@p2", parameterValue);

                    if (functionParams.length === 2) {
                        let parameterValue2 = replaceQuotes(functionParams[1]);
                        formattedFunctionDeclaration = formattedFunctionDeclaration.replace("@p3", parameterValue2);
                    }
                }
            }
            parsedFilter = parsedFilter.replace(queryFuncData, formattedFunctionDeclaration);
            runningFilterLowerCase = runningFilterLowerCase.replace(queryFuncData.toLowerCase(), "");
        }

    });




    return parsedFilter;
}


const replaceQuotes = (stText: string): string => {

    return stText.replace(/'/g, '').replace(/"/g, '');

}


const getQueryFunctionMetadataList = (): QueryFunction[] => {
    let queryFunctions = Array<QueryFunction>();
    let queryFunctionNames = getAvailableQueryFunctionNames();

    (queryFunctionNames).forEach(functionName => {
        let funcDefinition = getFunctionDefinition(functionName);
        if (funcDefinition) {
            queryFunctions.push(funcDefinition);
        }
    });
    return queryFunctions;
}


const getAvailableQueryFunctionNames = (): string[] => {


    let queryFunctionNames: Array<string> = [
        "Above",
        "AboveOrEqual",
        "Between",
        "ContainValues",
        "DoesNotContainValues",
        "EqualBusinessId",
        "EqualUserId",
        "EqualUserLanguage",
        "EqualUserOrUserHierarchy",
        "EqualUserOrUserHierarchyAndTeams",
        "EqualUserOrUserTeams",
        "EqualUserTeams",
        "In",
        "InFiscalPeriod",
        "InFiscalPeriodAndYear",
        "InFiscalYear",
        "InOrAfterFiscalPeriodAndYear",
        "InOrBeforeFiscalPeriodAndYear",
        "Last7Days",
        "LastFiscalPeriod",
        "LastFiscalYear",
        "LastMonth",
        "LastWeek",
        "LastXDays",
        "LastXFiscalPeriods",
        "LastXFiscalYears",
        "LastXHours",
        "LastXMonths",
        "LastXWeeks",
        "LastXYears",
        "LastYear",
        "Next7Days",
        "NextFiscalPeriod",
        "NextFiscalYear",
        "NextMonth",
        "NextWeek",
        "NextXDays",
        "NextXFiscalPeriods",
        "NextXFiscalYears",
        "NextXHours",
        "NextXMonths",
        "NextXWeeks",
        "NextXYears",
        "NextYear",
        "NotBetween",
        "NotEqualBusinessId",
        "NotEqualUserId",
        "NotIn",
        "NotUnder",
        "OlderThanXDays",
        "OlderThanXHours",
        "OlderThanXMinutes",
        "OlderThanXMonths",
        "OlderThanXWeeks",
        "OlderThanXYears",
        "On",
        "OnOrAfter",
        "OnOrBefore",
        "ThisFiscalPeriod",
        "ThisFiscalYear",
        "ThisMonth",
        "ThisWeek",
        "ThisYear",
        "Today",
        "Tomorrow",
        "Under",
        "UnderOrEqual",
        "Yesterday"
    ];

    return queryFunctionNames;

}


const getFunctionDefinition = (functionName: string): QueryFunction | undefined => {

    let functionDefinition;

    switch (functionName) {

        case "Contains":
        case "Above":
        case "AboveOrEqual":
        case "NotUnder":
        case "UnderOrEqual":
        case "Under":
        case "On":
        case "OnOrAfter":
        case "OnOrBefore":
            functionDefinition = {
                Name: functionName,
                Parameters: [{
                    Name: "PropertyName",
                    Type: "Edm.String",
                    Nullable: false,
                    Unicode: false
                },
                {
                    Name: "PropertyValue",
                    Type: "Edm.String",
                    Nullable: false,
                    Unicode: false
                }],
                ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
                DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1,PropertyValue=@p2)`
            };
            break;



        case "ContainValues":
        case "DoesNotContainValues":
        case "Between":
        case "NotBetween":
        case "NotIn": functionDefinition = {
            Name: functionName,
            Parameters: [{
                Name: "PropertyName",
                Type: "Edm.String",
                Nullable: false,
                Unicode: false
            },
            {
                Name: "PropertyValues",
                Type: "Collection(Edm.String)",
                Nullable: false,
                Unicode: false
            }],
            ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
            DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1,PropertyValues=@p2)`
        };
            break;




        case "EqualBusinessId":
        case "NotEqualBusinessId":
        case "EqualUserId":
        case "NotEqualUserId":
        case "EqualUserLanguage":
        case "EqualUserOrUserHierarchy":
        case "EqualUserOrUserHierarchyAndTeams":
        case "EqualUserTeams":
        case "EqualUserOrUserTeams": functionDefinition = {
            Name: functionName,
            Parameters: [{
                Name: "PropertyName",
                Type: "Edm.String",
                Nullable: false,
                Unicode: false
            }],
            ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
            DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1)`
        };
            break;


        case "InFiscalYear":
        case "InFiscalPeriod":
        case "LastXFiscalPeriods":
        case "LastXFiscalYears":
        case "NextXDays":
        case "NextXFiscalPeriods":
        case "NextXFiscalYears":
        case "NextXHours":
        case "NextXMonths":
        case "NextXWeeks":
        case "NextXYears":
        case "LastXHours":
        case "LastXMonths":
        case "LastXWeeks":
        case "LastXYears":
        case "LastXDays":
        case "OlderThanXDays":
        case "OlderThanXHours":
        case "OlderThanXMinutes":
        case "OlderThanXMonths":
        case "OlderThanXWeeks":
        case "OlderThanXYears":
            functionDefinition = {
                Name: functionName,
                Parameters: [{
                    Name: "PropertyName",
                    Type: "Edm.String",
                    Nullable: false,
                    Unicode: false
                },
                {
                    Name: "PropertyValue",
                    Type: "Edm.Int64",
                    Nullable: false,
                    Unicode: false
                }],
                ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
                DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1,PropertyValue=@p2)`
            };
            break;


        case "InFiscalPeriodAndYear":
        case "InOrAfterFiscalPeriodAndYear":
        case "InOrBeforeFiscalPeriodAndYear":
            functionDefinition = {
                Name: functionName,
                Parameters: [{
                    Name: "PropertyName",
                    Type: "Edm.String",
                    Nullable: false,
                    Unicode: false
                },
                {
                    Name: "PropertyValue1",
                    Type: "Edm.Int64",
                    Nullable: false,
                    Unicode: false
                },
                {
                    Name: "PropertyValue2",
                    Type: "Edm.Int64",
                    Nullable: false,
                    Unicode: false
                }],
                ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
                DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1,PropertyValue1=@p2,PropertyValue2=@p3)`
            };
            break;

        case "Last7Days":
        case "LastFiscalPeriod":
        case "LastFiscalYear":
        case "LastYear":
        case "Next7Days":
        case "NextFiscalPeriod":
        case "NextFiscalYear":
        case "NextMonth":
        case "NextWeek":
        case "NextYear":
        case "LastMonth":
        case "ThisFiscalPeriod":
        case "ThisFiscalYear":
        case "ThisMonth":
        case "ThisWeek":
        case "ThisYear":
        case "LastWeek":
        case "Tomorrow":
        case "Today":
        case "Yesterday": functionDefinition = {
            Name: functionName,
            Parameters: [{
                Name: "PropertyName",
                Type: "Edm.String",
                Nullable: false,
                Unicode: false
            }],
            ReturnInfo: { Type: "Edm.Boolean", Nullable: false },
            DeclarationTemplate: `Microsoft.Dynamics.CRM.${functionName}(PropertyName=@p1)`
        };
            break;


        default: functionDefinition = undefined;
            break;
    }


    return functionDefinition
}