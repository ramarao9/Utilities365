import { CLIVerb, IntelliSenseType, MINIMUM_CHARS_FOR_INTELLISENSE } from "../interfaces/CliIntelliSense";
import { getEntities } from "../services/CrmMetadataService";
import { getEntityCollectionName, getAttributeDisplayName, getEntityDisplayLabel } from "./metadatautil";
import { EntityMetadata, AttributeMetadata, PicklistMetadata } from "../interfaces/EntityMetadata";
import { CliData, ActionParam } from "../interfaces/CliData";
import { Action } from "redux";

export const getCleanedCLIVerbs = (cliVerbs: Array<CLIVerb>): Array<CLIVerb> => {
    cliVerbs = cliVerbs.map((x) => {
        x.isSelected = false;
        return x;
    });

    if (cliVerbs.length > 0) {

        let verbsWithOrder = cliVerbs.filter(x => x.order);
        let verbsWithoutOrder = cliVerbs.filter(x => !x.order);

        verbsWithOrder.sort((a: any, b: any) => {
            return a.order > b.order ? 1 : -1
        });

        verbsWithoutOrder.sort((a, b) => {
            return a.name > b.name ? 1 : -1
        });

        let sortedVerbs = [...verbsWithOrder, ...verbsWithoutOrder];
        sortedVerbs[0].isSelected = true;
        return sortedVerbs;
    }
    return cliVerbs;
}


export const getEntityCLIVerbs = async () => {

    let cliResults: Array<CLIVerb> = [];
    let entititesResults = await getCLIVerbsForEntitiesWrite();
    cliResults = cliResults.concat(entititesResults);
    cliResults = getCleanedCLIVerbs(cliResults);
    return cliResults;

}

export const getCLIVerbsForEntities = async () => {

    let cliResults: Array<CLIVerb> = [];
    let entitiesMetadata = await getEntities();
    cliResults = entitiesMetadata.map((entityMetadata: EntityMetadata) => {
        let collectionDisplayName = getEntityCollectionName(entityMetadata)
        let cliVerb: CLIVerb = {
            name: `${collectionDisplayName}`,
            text: entityMetadata.EntitySetName
        };
        return cliVerb;
    });
    return cliResults;
}


export const getCLIVerbsForEntitiesWrite = async () => {

    let cliResults: Array<CLIVerb> = [];
    let entitiesMetadata = await getEntities();
    cliResults = entitiesMetadata.map((entityMetadata: EntityMetadata) => {
        let entityDisplayLabel = getEntityDisplayLabel(entityMetadata)
        let cliVerb: CLIVerb = {
            name: `${entityDisplayLabel}`,
            text: entityMetadata.LogicalName
        };
        return cliVerb;
    });
    return cliResults;
}



export const getCLIVerbsForAttributes = (entityMetadata: EntityMetadata): Array<CLIVerb> => {
    let attributeCliResults: Array<CLIVerb> = [];
    let attributes = entityMetadata.Attributes;
    let picklistAttributes = entityMetadata.PicklistAttributes;
    attributeCliResults = getAttributesVerbs(attributes);
    return attributeCliResults;
}


const getAttributesVerbs = (attributes: AttributeMetadata[]): Array<CLIVerb> => {

    let attributeCliResults: Array<CLIVerb> = [];
    attributes = attributes.filter(x => x.AttributeType !== "Uniqueidentifier" && (x.IsValidForCreate || x.IsValidForUpdate));

    attributeCliResults = attributes.map((attributeMetadata: AttributeMetadata) => {
        let attributeDisplayname = getAttributeDisplayName(attributeMetadata);
        let cliVerb: CLIVerb = {
            name: `${attributeDisplayname}`,
            text: `${attributeMetadata.LogicalName}`,
            type: IntelliSenseType.ActionParams
        }

        return cliVerb;
    });

    return attributeCliResults;
}



const getPicklistAttributesVerbs = (attributes: PicklistMetadata[]): Array<CLIVerb> => {

    let picklistAttributeCliResults: Array<CLIVerb> = [];
    picklistAttributeCliResults = attributes.map((picklistMetadata: PicklistMetadata) => {

        let cliVerb: CLIVerb = {
            name: picklistMetadata.LogicalName,
            text: picklistMetadata.LogicalName
        }

        return cliVerb;
    });

    return picklistAttributeCliResults;
}



export const currentParamHasValue = (cliDataVal: CliData): boolean => {
    let lastActionParam = getLastParam(cliDataVal);
    return (lastActionParam && lastActionParam.value && lastActionParam.value.length > 0);
}

export const getLastParam = (cliDataVal: CliData): ActionParam | undefined => {

    let actionParams = cliDataVal.actionParams;

    if (!actionParams || actionParams.length === 0)
        return undefined;

    let lastActionParam = actionParams[actionParams.length - 1];
    let paramName = lastActionParam && lastActionParam.name ? `${lastActionParam.name.toLowerCase()}` : null;

    if (paramName === null) {
        return undefined;
    }

    return lastActionParam;
}





export const getNameVerbsPartialOrNoMatch = (userInput: string, actionParam: ActionParam | undefined, verbs: CLIVerb[]): CLIVerb[] | undefined => {
    let paramName = actionParam && actionParam.name ? actionParam.name.toLowerCase() : "";
    let paramMatched = verbs.find(x => x.name.toLowerCase() === paramName);

    if (userInput.endsWith(" ") && actionParam?.value) {
        return verbs.filter(x=>x.name.toLowerCase()!==paramName.toLowerCase());
    }
    else if (paramMatched && !userInput.endsWith(" ") && !actionParam?.value) {
        return [];
    }
    else if (paramMatched) {//When the Param name is already populated, this indicates we need to provide the Verbs for the param value, so return undefined here
        return undefined;
    }
    else if (paramName.length > 0) {//No param has been completely matched.In this case just filter the results
        return verbs.filter(x => x.name.toLowerCase().startsWith(paramName));
    } else {
        return verbs;
    }
}


export const getFilteredVerbs = (nameToFilterOn: string, verbs: CLIVerb[]): CLIVerb[] => {

    if (nameToFilterOn == null)
        return verbs;

    return verbs.filter(x => x.name.toLowerCase().startsWith(nameToFilterOn.toLowerCase()));
}