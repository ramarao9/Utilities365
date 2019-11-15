import { Option, OptionData } from "../interfaces/EntityMetadata";
import { CliData, ActionParam } from "../interfaces/CliData"
import { expand } from "../interfaces/expand";
import { getArrayFromCSV, getParamVal, getAttributeMetadataName, getFirstLabelFromLocalizedLabels } from "../helpers/common";

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