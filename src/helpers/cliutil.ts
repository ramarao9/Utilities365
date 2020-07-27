import { CLIVerb, IntelliSenseType, MINIMUM_CHARS_FOR_INTELLISENSE } from "../interfaces/CliIntelliSense";
import { getEntities } from "../services/CrmMetadataService";
import { getEntityCollectionName, getAttributeDisplayName, getEntityDisplayLabel } from "./metadatautil";
import { EntityMetadata, AttributeMetadata, PicklistMetadata } from "../interfaces/EntityMetadata";
import { CliData } from "../interfaces/CliData";

export const getCleanedCLIVerbs = (cliVerbs: Array<CLIVerb>): Array<CLIVerb> => {
    cliVerbs = cliVerbs.map((x) => {
        x.isSelected = false;
        return x;
    });

    if (cliVerbs.length > 0) {

        let verbsWithOrder = cliVerbs.filter(x => x.order);
        let verbsWithoutOrder= cliVerbs.filter(x => !x.order);

        verbsWithOrder.sort((a:any, b:any) => {
            return  a.order > b.order ? 1 : -1
        });

        verbsWithoutOrder.sort((a, b) => {
            return a.name > b.name ? 1 : -1
        });

        let sortedVerbs=[...verbsWithOrder,...verbsWithoutOrder];       
        sortedVerbs[0].isSelected = true;
        return sortedVerbs;
    }
    return cliVerbs;
}


export const getEntityCLIVerbs = async (cliDataVal: CliData) => {

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