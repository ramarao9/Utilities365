import { CliData, ActionParam } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/Target/Get"
import { CLI_ACTION_PARAMS_GET_RECORDS, CLI_ACTION_PARAMS_GET_ENTITY, CLI_ACTION_PARAMS_GET_ENTITIES, CLI_ACTION_PARAMS_GET_ATTRIBUTE, CLI_ACTION_PARAMS_GET_ATTRIBUTES, GROUP_NAME_FILTER_ATTRIBUTES } from "../Definitions/ActionParams/Get"
import { getEntities, getEntityMetadataBasic } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs, getCLIVerbsForEntities, getLastParam, getNameVerbsPartialOrNoMatch, getEntityCLIVerbs, getFilteredVerbs, getVerbsFromCSV, getCLIVerbsAttributes } from "../../../helpers/cliutil";
import { getEntityCollectionName } from "../../../helpers/metadatautil";
import { getActionParam } from "../../../helpers/QueryHelper";
import { getEntityViews } from "../../ViewService";
import { ViewType } from "../../../interfaces/ViewData";

export const getTargetForGet = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let entititesResults = await getCLIVerbsForEntities();
    cliResults = cliResults.concat(CLI_TARGET_GET);//Default targets
    cliResults = cliResults.concat(entititesResults);
    cliResults = getCleanedCLIVerbs(cliResults);
    return cliResults;
}




export const getActionParamsForGet = async (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.target) {


        case "attribute": cliResults = await getActionParamsForAttribute(userInput, cliDataVal) as Array<CLIVerb>;
            break;

        case "attributes": cliResults = await getActionParamsForAttributes(userInput, cliDataVal) as Array<CLIVerb>;
            break;

        case "entity": cliResults = await getActionsParamsForEntity(userInput, cliDataVal) as Array<CLIVerb>;
            break;

        case "entities": cliResults = await getActionsParamsForEntities(userInput, cliDataVal) as Array<CLIVerb>;
            break;

        case "org-detail":
            break;

        //Get records 
        default: cliResults = await getActionParamsForRecords(userInput, cliDataVal) as Array<CLIVerb>;
            break;
    }

    return cliResults;
}


const getActionParamsForAttribute = async (userInput: string, cliDataVal: CliData) => {


    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, CLI_ACTION_PARAMS_GET_ATTRIBUTE);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "entity": cliResults = await getEntityVerbs(lastParam);
            break;

        case "type": cliResults = await getAttributeVerbs(cliDataVal, lastParam);
            break;

        case "properties": cliResults = getAttributePropertiesVerbs(lastParam);
            break;
    }

    return cliResults;


}




const getActionParamsForAttributes = async (userInput: string, cliDataVal: CliData) => {


    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, CLI_ACTION_PARAMS_GET_ATTRIBUTES);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "entity": cliResults = await getEntityVerbs(lastParam);
            break;

        case "type": cliResults = await getAttributesTypeVerbs(cliDataVal, lastParam);
            break;

        case "properties": cliResults = getAttributePropertiesVerbs(lastParam);
            break;

        case "expand": cliResults = await getAttributesExpandVerbs(cliDataVal, lastParam);
            break;

    }

    return cliResults;


}


const getAttributesTypeVerbs = async (cliData: CliData, lastParam: ActionParam) => {

    let cliResults: Array<CLIVerb> = [];
    let attributeTypes = ["string", "integer", "boolean", "lookup", "picklist", "datetime", "money", "decimal"];

    attributeTypes.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue };
        cliResults.push(cliVerb);
    });

    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;
}

const getAttributesExpandVerbs = async (cliData: CliData, lastParam: ActionParam) => {

    let cliResults: Array<CLIVerb> = [];

    let typeParam = getActionParam("type", cliData.actionParams);

    if (!typeParam || (typeParam.name !== "optionset" && typeParam.name !== "picklist"))
        return [];


    let attributeExpand = ["OptionSet"];
    attributeExpand.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue };
        cliResults.push(cliVerb);
    });

    return cliResults;
}

const getAttributeVerbs = async (cliData: CliData, lastParam: ActionParam) => {

    let entityParam = getActionParam("entity", cliData.actionParams);

    if (!entityParam)
        return [];

    let cliResults: Array<CLIVerb> = await getCLIVerbsAttributes(entityParam.value, IntelliSenseType.ActionParamValue, true);
    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;
}

const getAttributePropertiesVerbs = (lastParam: ActionParam): CLIVerb[] => {

    let attributeProperties = getPropertiesOnAttribute();
    let attributePropertiesCliVerbs: CLIVerb[] = [];
    attributeProperties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue, delimiterForMerging: "," };
        attributePropertiesCliVerbs.push(cliVerb);
    });

    attributePropertiesCliVerbs = getVerbsFromCSV(lastParam.value, attributePropertiesCliVerbs);
    return attributePropertiesCliVerbs;
}




const getPropertiesOnAttribute = (): string[] => {
    return ["AttributeOf",
        "AttributeType",
        "AutoNumberFormat",
        "CanBeSecuredForCreate",
        "CanBeSecuredForRead",
        "CanBeSecuredForUpdate",
        "CanModifyAdditionalSettings",
        "ColumnNumber",
        "DefaultFormValue",
        "DeprecatedVersion",
        "Description",
        "DisplayName",
        "EntityLogicalName",
        "ExternalName",
        "FormulaDefinition",
        "HasChanged",
        "InheritsFrom",
        "IntroducedVersion",
        "IsAuditEnabled",
        "IsCustomAttribute",
        "IsCustomizable",
        "IsDataSourceSecret",
        "IsFilterable",
        "IsGlobalFilterEnabled",
        "IsLogical",
        "IsManaged",
        "IsPrimaryId",
        "IsPrimaryName",
        "IsRenameable",
        "IsRequiredForForm",
        "IsRetrievable",
        "IsSearchable",
        "IsSecured",
        "IsSortableEnabled",
        "IsValidForAdvancedFind",
        "IsValidForCreate",
        "IsValidForForm",
        "IsValidForRead",
        "IsValidForUpdate",
        "LinkedAttributeId",
        "LogicalName",
        "MetadataId",
        "RequiredLevel",
        "SchemaName",
        "SourceType",
        "SourceTypeMask"];
}



export const getActionsParamsForEntity = async (userInput: string, cliDataVal: CliData) => {

    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, CLI_ACTION_PARAMS_GET_ENTITY);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "entity": cliResults = await getEntityVerbs(lastParam);
            break;

        case "expand": cliResults = await getEntityExpandVerbs(lastParam);
            break;

        case "properties": cliResults = getEntityPropertiesVerbs(lastParam);
            break;
    }

    return cliResults;
}

const getEntityVerbs = async (lastParam: ActionParam) => {
    let cliResults: Array<CLIVerb> = await getEntityCLIVerbs();
    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;
}

const getEntityExpandVerbs = async (lastParam: ActionParam) => {
    let expandPropertiesCliVerbs: Array<CLIVerb> = [];
    let expandProperties = ["Attributes", "Keys", "OneToManyRelationships", "ManyToOneRelationships", "ManyToManyRelationships"];
    expandProperties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue, delimiterForMerging: "," };
        expandPropertiesCliVerbs.push(cliVerb);
    });
    expandPropertiesCliVerbs = getVerbsFromCSV(lastParam.value, expandPropertiesCliVerbs);
    return expandPropertiesCliVerbs;
}

const getEntityPropertiesVerbs = (lastParam: ActionParam): CLIVerb[] => {

    let entityProperties = getPropertiesOnEntity();
    let entityPropertiesCliVerbs: CLIVerb[] = [];
    entityProperties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue, delimiterForMerging: "," };
        entityPropertiesCliVerbs.push(cliVerb);
    });


    entityPropertiesCliVerbs = getVerbsFromCSV(lastParam.value, entityPropertiesCliVerbs);
    return entityPropertiesCliVerbs;
}

export const getActionsParamsForEntities = async (userInput: string, cliDataVal: CliData) => {

    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, CLI_ACTION_PARAMS_GET_ENTITIES);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "entities": cliResults = await getEntitiesEntitiesVerbs(lastParam);
            break;

        case "filter":
            break;

        case "properties": cliResults = getEntityPropertiesVerbs(lastParam);
            break;
    }

    return cliResults;
}

const getEntitiesEntitiesVerbs = async (lastParam: ActionParam) => {

    let cliResults: Array<CLIVerb> = await getEntityCLIVerbs();
    cliResults.forEach(x => {
        x.type = IntelliSenseType.ActionParamValue;
        x.delimiterForMerging = ",";
    })

    cliResults = getVerbsFromCSV(lastParam.value, cliResults);
    return cliResults;
}

const getPropertiesOnEntity = (): string[] => {
    return ["ActivityTypeMask",
        "AutoCreateAccessTeams",
        "AutoRouteToOwnerQueue",
        "CanBeInManyToMany",
        "CanBePrimaryEntityInRelationship",
        "CanBeRelatedEntityInRelationship",
        "CanChangeHierarchicalRelationship",
        "CanChangeTrackingBeEnabled",
        "CanCreateAttributes",
        "CanCreateCharts",
        "CanCreateForms",
        "CanCreateViews",
        "CanEnableSyncToExternalSearchIndex",
        "CanModifyAdditionalSettings",
        "CanTriggerWorkflow",
        "ChangeTrackingEnabled",
        "CollectionSchemaName",
        "DataProviderId",
        "DataSourceId",
        "DaysSinceRecordLastModified",
        "Description",
        "DisplayCollectionName",
        "DisplayName",
        "EnforceStateTransitions",
        "EntityColor",
        "EntityHelpUrl",
        "EntityHelpUrlEnabled",
        "EntitySetName",
        "ExternalCollectionName",
        "ExternalName",
        "IconLargeName",
        "IconMediumName",
        "IconSmallName",
        "IconVectorName",
        "IntroducedVersion",
        "IsActivity",
        "IsActivityParty",
        "IsAIRUpdated",
        "IsAuditEnabled",
        "IsAvailableOffline",
        "IsBPFEntity",
        "IsBusinessProcessEnabled",
        "IsChildEntity",
        "IsConnectionsEnabled",
        "IsCustomEntity",
        "IsCustomizable",
        "IsDocumentManagementEnabled",
        "IsDocumentRecommendationsEnabled",
        "IsDuplicateDetectionEnabled",
        "IsEnabledForCharts",
        "IsEnabledForExternalChannels",
        "IsEnabledForTrace",
        "IsImportable",
        "IsInteractionCentricEnabled",
        "IsIntersect",
        "IsKnowledgeManagementEnabled",
        "IsLogicalEntity",
        "IsMailMergeEnabled",
        "IsManaged",
        "IsMappable",
        "IsOfflineInMobileClient",
        "IsOneNoteIntegrationEnabled",
        "IsOptimisticConcurrencyEnabled",
        "IsPrivate",
        "IsQuickCreateEnabled",
        "IsReadingPaneEnabled",
        "IsReadOnlyInMobileClient",
        "IsRenameable",
        "IsSLAEnabled",
        "IsStateModelAware",
        "IsValidForAdvancedFind",
        "IsValidForQueue",
        "IsVisibleInMobile",
        "IsVisibleInMobileClient",
        "Keys",
        "LogicalCollectionName",
        "LogicalName",
        "ManyToManyRelationships",
        "ManyToOneRelationships",
        "MetadataId",
        "MobileOfflineFilters",
        "ObjectTypeCode",
        "OneToManyRelationships",
        "OwnershipType",
        "PrimaryIdAttribute",
        "PrimaryImageAttribute",
        "PrimaryNameAttribute",
        "Privileges",
        "RecurrenceBaseEntityLogicalName",
        "ReportViewName",
        "SchemaName",
        "SyncToExternalSearchIndex",
        "UsesBusinessDataLabelTable"];
}


//Retrieves the CLI Verbs for either the parameter itself or for the data that needs to be set for the parameter
const getActionParamsForRecords = async (userInput: string, cliDataVal: CliData) => {


    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let entityMetadata: EntityMetadata = await getEntityMetadataBasic(cliDataVal.target);

    if (!entityMetadata)
        return;

    let attributes: Array<CLIVerb> = await getCliVerbsForAttributesOnGet(entityMetadata.LogicalName);
    let cliVerbs: CLIVerb[] = [...attributes,...CLI_ACTION_PARAMS_GET_RECORDS];
    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, cliVerbs);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "select": cliResults = await getRecordsSelectVerbs(cliDataVal, lastParam);
            break;

        case "filter":
            break;

        case "view": cliResults = await getRecordsViewVerbs(cliDataVal, lastParam);
            break;

        case "top": cliResults = getRecordsTopVerbs(cliDataVal, lastParam);
            break;
    }

    return cliResults;
}


const getCliVerbsForAttributesOnGet=async (entityLogicalName:string)=>{
    let attributes: Array<CLIVerb> = await getCLIVerbsAttributes(entityLogicalName, IntelliSenseType.ActionParams, true);

    attributes.forEach(x=>{
        x.group=GROUP_NAME_FILTER_ATTRIBUTES
        x.groupNumber=20;
    });

    return attributes;
}

const getRecordsSelectVerbs = async (cliData: CliData, lastParam: ActionParam) => {

    let entityCollectionName = cliData.target;
    let entityMetadata = await getEntityMetadataBasic(entityCollectionName);

    let cliResults: Array<CLIVerb> = await getCLIVerbsAttributes(entityMetadata.LogicalName, IntelliSenseType.ActionParamValue, true);
    cliResults.forEach(x => {
        x.type = IntelliSenseType.ActionParamValue;
        x.delimiterForMerging = ",";
    })

    cliResults = getVerbsFromCSV(lastParam.value, cliResults);
    return cliResults;
}


const getRecordsViewVerbs = async (cliData: CliData, lastParam: ActionParam) => {

    let cliResults: Array<CLIVerb> = [];

    let entityViewData = await getEntityViews(cliData.target);
    let views = entityViewData.views

    views.forEach(x => {
        let group = (x.type == ViewType.SystemView) ? "System Views" : "My Views";
        let groupOrder = (x.type == ViewType.SystemView) ? 1 : 2;
        let cliVerb: CLIVerb = {
            name: x.name,
            type: IntelliSenseType.ActionParamValue,
            group: group,
            groupNumber: groupOrder
        };
        cliResults.push(cliVerb);
    });

    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;
}


const getRecordsTopVerbs = (cliData: CliData, lastParam: ActionParam): Array<CLIVerb> => {

    let properties = ["5", "10", "25", "50", "100", "250"];

    let cliResults: Array<CLIVerb> = [];
    properties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue };
        cliResults.push(cliVerb);
    });

    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;

}