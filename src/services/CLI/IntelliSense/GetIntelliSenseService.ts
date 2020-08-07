import { CliData, ActionParam } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/Target/Get"
import { CLI_ACTION_PARAMS_GET_RECORDS, CLI_ACTION_PARAMS_GET_ENTITY, CLI_ACTION_PARAMS_GET_ENTITIES } from "../Definitions/ActionParams/Get"
import { getEntities } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs, getCLIVerbsForEntities, getLastParam, getNameVerbsPartialOrNoMatch, getEntityCLIVerbs, getFilteredVerbs } from "../../../helpers/cliutil";
import { getEntityCollectionName } from "../../../helpers/metadatautil";

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


        case "attribute":
            break;

        case "attributes":
            break;

        case "entity": cliResults = await getActionsParamsForEntity(userInput, cliDataVal) as Array<CLIVerb>;
            break;

        case "entities":
            break;

        case "org-detail":
            break;

        //Get records 
        default: cliResults = await getCurrentActionParamVerbsForRecords(userInput, cliDataVal) as Array<CLIVerb>;
            break;
    }

    return cliResults;
}

export const getActionsParamsForEntity = async (userInput: string, cliDataVal: CliData) => {

    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, CLI_ACTION_PARAMS_GET_ENTITY);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //Handle when Param completely matched
    let cliResults: Array<CLIVerb> = [];
    switch (lastParam?.name) {

        case "entity": cliResults = await getEntityEntityVerbs(lastParam);
            break;

        case "expand":
            break;

        case "properties": cliResults = getEntityPropertiesVerbs(lastParam);
            break;
    }

    return cliResults;
}

const getEntityEntityVerbs = async (lastParam: ActionParam) => {
    let cliResults: Array<CLIVerb> = await getEntityCLIVerbs();
    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;
}

const getEntityPropertiesVerbs = (lastParam: ActionParam): CLIVerb[] => {

    let entityProperties = getPropertiesOnEntity();
    let entityPropertiesCliVerbs: CLIVerb[] = [];
    entityProperties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue };
        entityPropertiesCliVerbs.push(cliVerb);
    });


    let propertiesCSV: string = lastParam.value;
    let properties: string[] = propertiesCSV ? propertiesCSV.split(",") : [];
    if (properties.length > 0 && !propertiesCSV.endsWith(",")) {
        return [];
    }

    entityPropertiesCliVerbs = entityPropertiesCliVerbs.filter(x => x.name &&
        properties.findIndex(y => y.toLowerCase() === x.name.toLowerCase()) === -1);

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

        case "entities": cliResults = await getEntitiesEntiesVerbs(lastParam);
            break;

        case "filter":
            break;

        case "properties": cliResults = getEntityPropertiesVerbs(lastParam);
            break;
    }

    return cliResults;
}


const getEntitiesEntiesVerbs = async (lastParam: ActionParam) => {
    let cliResults: Array<CLIVerb> = await getEntityCLIVerbs();



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
const getCurrentActionParamVerbsForRecords = async (userInput: string, cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let actionParams = cliDataVal.actionParams;

    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);

    if (lastParam == undefined || lastParam.name == undefined)
        return CLI_ACTION_PARAMS_GET_RECORDS;


    let lastParamName = lastParam.name.toLowerCase();
    let paramMatched = CLI_ACTION_PARAMS_GET_RECORDS.find(x => x.name.toLowerCase() === lastParamName);
    let paramValue = lastParam.value;
    if (paramMatched) {//When the Param name is already populated, this indicates we need to provide the Verbs for the data present in the value
        cliResults = await getVerbsForODataQueryOptions(paramValue) as Array<CLIVerb>;
    }
    else if (lastParamName && lastParamName.length > 0) {//No param has been completely matched.In this case just filter the results
        cliResults = CLI_ACTION_PARAMS_GET_RECORDS.filter(x => x.name.toLowerCase().startsWith(lastParamName!!));
    }

    return cliResults;
}


const getVerbsForODataQueryOptions = async (paramValue: string) => {

    let cliResults: Array<CLIVerb> = [];


    //identify if the param is top, filter or select and identify what dynamics verb results need to be shown


    return cliResults;


}