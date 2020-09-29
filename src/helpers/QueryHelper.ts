import { Option, OptionData, EntityMetadata, AttributeMetadata } from "../interfaces/EntityMetadata";
import { CliData, ActionParam } from "../interfaces/CliData"
import { expand } from "../interfaces/expand";
import { getArrayFromCSV, getParamVal, getAttributeMetadataName, getFirstLabelFromLocalizedLabels } from "../helpers/common";
import { QueryFunction, FunctionParameter, FunctionReturnType } from "../interfaces/QueryFunction";

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
    else if (type && type.indexOf("Picklist") != -1) {
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
    return (matchedActionParam != undefined);

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

export const buildFilterUsingAttributeParams = (entitymetadata: EntityMetadata, actionParams: Array<ActionParam>): string => {

    let attributes = entitymetadata.Attributes;

    let filterOperator=getFilterOperator(actionParams);
    let filter: string = actionParams.reduce((acc: string, x: ActionParam, currentIndex: number): string => {
        let attributeLogicalName = x.name.toLowerCase();
        let attributeMetadata = attributes.find(x => x.LogicalName === attributeLogicalName);
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

const getODataCondition = (attQueryInfo: string, attributeMetadata: AttributeMetadata): string | undefined => {


    let attQueryArr = attQueryInfo.split(' ');
    let attValue = attQueryArr.length === 2 ? attQueryArr[1] : attQueryArr[0];
    let condOperator = attQueryArr.length === 2 ? attQueryArr[0] : "eq";

    let attValueOnFilter = getAttributeValueOnODataFilter(attValue, attributeMetadata);
    if (!attValueOnFilter)
        return attValueOnFilter;

    let oDataCondition: string = `${attributeMetadata.LogicalName} ${condOperator} ${attValueOnFilter}`;
    return oDataCondition;

}


const getAttributeValueOnODataFilter = (attValue: string, attributeMetadata: AttributeMetadata): string | undefined => {

    let valueToUseForFilter = undefined;
    switch (attributeMetadata.AttributeType) {

        case "Memo":
        case "String": valueToUseForFilter = `'${attValue}'`;
            break;

        case "Money":
        case "DateTime":
        case "Boolean":
        case "Picklist":
        case "Lookup":
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

        while (runningFilterLowerCase.indexOf(functionNameLC + "(") != -1) {

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
    let queryFunctionNames = getAvilableQueryFunctionNames();

    (queryFunctionNames).forEach(functionName => {
        let funcDefinition = getFunctionDefinition(functionName);
        if (funcDefinition) {
            queryFunctions.push(funcDefinition);
        }
    });
    return queryFunctions;
}


const getAvilableQueryFunctionNames = (): string[] => {


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