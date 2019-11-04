import { ActionParam } from "../interfaces/CliData";
import { Relationship } from "../interfaces/EntityMetadata";
import { Action } from "history";
import {JSONTreeTheme} from "../interfaces/JSONTreeTheme";


export const getArrayFromCSV = (csv?: string): Array<string> | undefined => {
    if (csv == null)
        return undefined;

    let strArr: Array<string> = csv.split(",").map(x => x.trim());
    return strArr;
}


export const getParamVal = (param: ActionParam): string | undefined => {
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

    return (params.findIndex(x => x.name.toLowerCase() === paramname.toLowerCase()) != -1);
}

export const getReferencingEntityNavPropertyName = (referencingAttribute: string, relationships: Array<Relationship>): string | undefined => {

    let relationship = getRelationship(referencingAttribute, relationships);
    return (relationship) ? relationship.ReferencingEntityNavigationPropertyName : undefined;
}

export const getRelationship = (referencingAttribute: string, relationships: Array<Relationship>): Relationship | undefined => {
    return relationships.find(x => x.ReferencingAttribute.toLowerCase() === referencingAttribute.toLowerCase());
}


export const getAttributeMetadataName = (attributeTypeShort:string): string => {

    switch (attributeTypeShort.toLowerCase()) {

        case "datetime": return "DateTime";
      
        case "bigint": return "BigInt";

        default:return capitalizeFirstLetter(attributeTypeShort.toLowerCase());
    }

}

export const capitalizeFirstLetter = (s:string) => { 
    return s.charAt(0).toUpperCase() + s.slice(1)
  }



  export const getJSONTreeTheme=() : JSONTreeTheme=>{

    const theme= {
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