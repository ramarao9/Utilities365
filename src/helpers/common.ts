import { ActionParam } from "../interfaces/CliData";
import { Relationship, LocalizedLabel } from "../interfaces/EntityMetadata";
import { JSONTreeTheme } from "../interfaces/JSONTreeTheme";


export const getArrayFromCSV = (csv?: string): Array<string> | undefined => {
    if (csv == null)
        return undefined;

    let strArr: Array<string> = csv.split(",").map(x => x.trim());
    return strArr;
}


export const getActionParamValue = (paramName: string, params: Array<ActionParam> | null |undefined) => {

    if (!params)
      return "";
  
    let actionParam = getActionParam(paramName, params);
    let paramVal = "";
  
    if (actionParam && actionParam.value) {
        paramVal = actionParam.value;
    }
  
    return paramVal;
  }


export const getParamVal = (param: ActionParam | undefined): string | undefined => {
    let paramVal = param ? param.value : undefined;
    return paramVal;
}

export const getActionParam = (paramName: string, params: Array<ActionParam>): ActionParam | undefined => {
    return params.find(x => x.name.toLowerCase().trim() === paramName.toLowerCase().trim());
}


export const removeActionParam = (paramName: string, params: Array<ActionParam>): Array<ActionParam> => {
    return params.filter(x => x.name.toLowerCase() !== paramName.toLowerCase());
}

export const hasActionParam = (paramname: string, params: Array<ActionParam> | undefined): boolean => {

    if (!params)
        return false;

    return (params.findIndex(x => x.name.toLowerCase() === paramname.toLowerCase()) !== -1);
}

export const getReferencingEntityNavPropertyName = (referencedEntity : string,referencingAttribute: string, relationships: Array<Relationship>): string | undefined => {

    let relationship = getRelationship(referencedEntity,referencingAttribute, relationships);
    return (relationship) ? relationship.ReferencingEntityNavigationPropertyName : undefined;
}

export const getRelationship = (referencedEntity : string,referencingAttribute: string, relationships: Array<Relationship>): Relationship | undefined => {
    return relationships.find(x => x.ReferencedEntity.toLowerCase()===referencedEntity.toLowerCase() &&
        x.ReferencingAttribute.toLowerCase() === referencingAttribute.toLowerCase());
}


export const getAttributeMetadataName = (attributeTypeShort: string): string => {

    switch (attributeTypeShort.toLowerCase()) {

        case "datetime": return "DateTime";

        case "bigint": return "BigInt";

        case "optionset": return "Picklist"

        default: return capitalizeFirstLetter(attributeTypeShort.toLowerCase());
    }

}

export const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}



export const getJSONTreeTheme = (): JSONTreeTheme => {

    const theme = {
        scheme: 'eighties',
        author: 'chris kempson (http://chriskempson.com)',
        base00: '#000',
        base01: '#393939',
        base02: '#515151',
        base03: '#747369',
        base04: '#a09f93',
        base05: '#d3d0c8',
        base06: '#e8e6df',
        base07: '#f2f0ec',
        base08: '#f44747',
        base09: '#b5cea8',
        base0A: '#ffcc66',
        base0B: '#ce9178',
        base0C: '#66cccc',
        base0D: '#9cdcfe',
        base0E: '#cc99cc',
        base0F: '#d27b53'
    };

    return theme;
}


export const getFirstLabelFromLocalizedLabels = (labels: Array<LocalizedLabel> | undefined): string => {

    let label = "";

    if (labels && labels.length > 0) {
        let locLabel = labels[0];
        return locLabel.Label;
    }

    return label;


}


export const isValidGuid = (id: string | undefined): boolean => {

    if (!id)
        return false;

    let isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);


    if (!isValid) {
        isValid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    }

    if(!isValid)
    {
        var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\}){0,1}$/gi;
        isValid= regexGuid.test(id);
    }
   

    return isValid;
}


export const extractContentFromText = (textToSearch: string, startText: string, endText: string): string | undefined => {

    let indexOfStartText = textToSearch.toLowerCase().indexOf(startText.toLowerCase());
    if (indexOfStartText === -1)
        return undefined;

    let subStringFromStartText = textToSearch.toLowerCase().substring(indexOfStartText);
    let indexOfEndText = subStringFromStartText.indexOf(endText);
    if (indexOfEndText === -1)
        return undefined;

    let extractedContent = subStringFromStartText.substring(startText.length, indexOfEndText);
    return extractedContent;
}