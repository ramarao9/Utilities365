import { CLIVerb, IntelliSenseType, MINIMUM_CHARS_FOR_INTELLISENSE } from "../interfaces/CliIntelliSense";
import { getEntities, getEntity } from "../services/CrmMetadataService";
import { getEntityCollectionName, getAttributeDisplayName, getEntityDisplayLabel } from "./metadatautil";
import { EntityMetadata, AttributeMetadata, PicklistMetadata } from "../interfaces/EntityMetadata";
import { CliData, ActionParam } from "../interfaces/CliData";
import { Action } from "redux";
import { Group } from "../interfaces/Group";

export const getCleanedCLIVerbs = (cliVerbs: Array<CLIVerb>): Array<CLIVerb> => {
    cliVerbs = cliVerbs.map((x) => {
        x.isSelected = false;
        return x;
    });

    if (cliVerbs.length > 0) {

        let verbsWithOrder = cliVerbs.filter(x => x.order);
        let verbsWithoutOrder = cliVerbs.filter(x => !x.order);

        verbsWithOrder.sort((a: any, b: any) => {
            return (a.order > b.order) ? 1 : -1
        });

        verbsWithoutOrder.sort(sortOnName);

        let sortedVerbs = [...verbsWithOrder, ...verbsWithoutOrder];
        sortedVerbs.filter(x => !x.group).forEach(x => {
            x.groupNumber = 0
            x.group = "Default"
        });

        let groups: Array<Group> = getGroups(sortedVerbs);
        let groupSortedVerbs: Array<CLIVerb> = [];
        groups.forEach(x => {
            let groupVerbs = sortedVerbs.filter(y => y.group === x.Name);
            groupVerbs.sort(sortOnName);
            groupSortedVerbs = [...groupSortedVerbs, ...groupVerbs];
        })

        if (groupSortedVerbs.length > 0) {
            groupSortedVerbs[0].isSelected = true;
        }


        return groupSortedVerbs;
    }
    return cliVerbs;
}

export const sortOnName = (a: CLIVerb, b: CLIVerb) => {
    return (a.name > b.name) ? 1 : -1
}

export const getGroups = (sortedVerbs: Array<CLIVerb>) => {
    let groupInfo = sortedVerbs.map(item => {
        return { Name: item.group, Order: item.groupNumber };
    });

    let groups: Array<Group> = sortedVerbs.length > 0 ?
        [...new Set(groupInfo.map(x => x.Name))].map(x => {
            return groupInfo.find(y => y.Name === x)
        }) as [] : [];

    groups.sort((a: Group, b: Group) => {
        return (a.Order > b.Order) ? 1 : -1
    });

    return groups;
}

export const removeODataTagsOnCollection = (records: any) => {
    if (records && records.length > 0) {
        records.forEach(function (record: any) {
            delete record["@odata.etag"]

            let objKeys = Object.keys(record);
            objKeys.forEach(x => {
                if (x.indexOf("@OData.Community.Display.V1.FormattedValue") != -1) {
                    delete record[x];
                }
            })


        });
    }
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


export const getCLIVerbsAttributes = async (entityLogicalName: string, intellisenseType?: IntelliSenseType, excludeFilters?: boolean) => {
    let entityMetadata = await getEntity(entityLogicalName) as EntityMetadata;

    let attributeCliResults: Array<CLIVerb> = getCLIVerbsForAttributes(entityMetadata, intellisenseType, excludeFilters);
    return attributeCliResults;
}

export const getCLIVerbsForAttributes = (entityMetadata: EntityMetadata, intellisenseType?: IntelliSenseType, excludeFilters?: boolean, isWriteOperation: boolean = false): Array<CLIVerb> => {
    let attributeCliResults: Array<CLIVerb> = [];
    let attributes = entityMetadata.Attributes;
    let picklistAttributes = entityMetadata.PicklistAttributes;
    attributeCliResults = getAttributesVerbs(attributes, intellisenseType, excludeFilters,isWriteOperation);
    return attributeCliResults;
}




const getAttributesVerbs = (attributes: AttributeMetadata[], intellisenseType?: IntelliSenseType, excludeFilters?: boolean, isWriteOperation: boolean = false): Array<CLIVerb> => {

    let attributeCliResults: Array<CLIVerb> = [];

    if (!excludeFilters) {
        attributes = attributes.filter(x => x.AttributeType !== "Uniqueidentifier" && (x.IsValidForCreate || x.IsValidForUpdate));
    }


    attributeCliResults = attributes.map((attributeMetadata: AttributeMetadata) => {
        let attributeDisplayname = getAttributeDisplayName(attributeMetadata);
        let cliVerb: CLIVerb = {
            name: `${attributeDisplayname}`,
            text: `${attributeMetadata.LogicalName}`,
            type: intellisenseType ?? IntelliSenseType.ActionParams
        }

        if (!isWriteOperation && (attributeMetadata.AttributeType === "Lookup" || attributeMetadata.AttributeType === "Customer")) {
            cliVerb.alternateText = `_${attributeMetadata.LogicalName}_value`;
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
    let paramName = actionParam && actionParam.name ? actionParam.name.toLowerCase().trim() : "";
    let paramMatched = verbs.find(x => x.name.toLowerCase() === paramName);

    if (userInput.endsWith(" ") && actionParam?.value) {
        return verbs.filter(x => x.name.toLowerCase() !== paramName.toLowerCase());
    }
    else if (paramMatched && !userInput.endsWith(" ") && !actionParam?.value) {
        return [];
    }
    else if (paramMatched) {//When the Param name is already populated, this indicates we need to provide the Verbs for the param value, so return undefined here
        return undefined;
    }
    else if (paramName.length > 0) {//No param has been completely matched.In this case just filter the results
        return verbs.filter(x => x.name.toLowerCase().startsWith(paramName) ||
            x.name.replace(/\s/g, "").toLowerCase().startsWith(paramName));
    } else {
        return verbs;
    }
}


export const getFilteredVerbs = (nameToFilterOn: string, verbs: CLIVerb[]): CLIVerb[] => {

    if (nameToFilterOn == null)
        return verbs;

    return verbs.filter(x => x.name.toLowerCase().startsWith(nameToFilterOn.toLowerCase()) ||
        (x.text && x.text.toLowerCase().startsWith(nameToFilterOn.toLowerCase())));
}

export const getVerbsFromCSV = (paramValueCSV: string, cliVerbsToFilter: CLIVerb[]): CLIVerb[] => {

    let paramItems: string[] = paramValueCSV ? paramValueCSV.split(",") : [];
    let lastItem = paramItems.length > 0 ? paramItems[paramItems.length - 1] : undefined;

    //if the last item has an exact match to a Cli verb in that case do not show any addiitonal verbs
    //In this case the user has made a selection, only if the last item does not have an exact match 
    //and if is empty than execute next steps

    if (lastItem && cliVerbsToFilter.findIndex(x => x.text && x.text.toLowerCase() === lastItem!!.toLowerCase()) !== -1) {
        return [];
    }

    let filteredVerbs = cliVerbsToFilter.filter(x => (x.name && paramItems.findIndex(y => y.toLowerCase() === x.name!!.toLowerCase()) === -1) ||
        (x.text && paramItems.findIndex(y => y.toLowerCase() === x.text!!.toLowerCase()) === -1));

    if (lastItem) {
        filteredVerbs = filteredVerbs.filter(x => x.name.toLowerCase().startsWith(lastItem!!.toLowerCase()) ||
            (x.text && x.text.toLowerCase().startsWith(lastItem!!.toLowerCase())));
    }

    return filteredVerbs;
}