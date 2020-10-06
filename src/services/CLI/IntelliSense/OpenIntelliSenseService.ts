import { ActionParam, CliData } from "../../../interfaces/CliData";
import { CLIVerb, IntelliSenseType, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { getCLIVerbsAttributes, getCLIVerbsForEntitiesWrite, getFilteredVerbs, getLastParam, getNameVerbsPartialOrNoMatch } from "../../../helpers/cliutil";
import { CLI_TARGET_OPEN, GROUP_NAME_OPEN_ENTITIES } from "../Definitions/Target/Open";
import { CLI_ACTION_PARAMS_OPEN_GENERIC, CLI_ACTION_PARAMS_OPEN_RECORD } from "../Definitions/ActionParams/Open";
import { EntityMetadata } from "../../../interfaces/EntityMetadata";
import { getEntityMetadataBasic } from "../../CrmMetadataService";
import { Switch } from "react-router";
import { Action } from "redux";
import { GROUP_NAME_FILTER_ATTRIBUTES } from "../Definitions/ActionParams/Get";


export const getTargetForOpen = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    cliResults = cliResults.concat(CLI_TARGET_OPEN);//Default targets
    let entititesResults = await getCliVerbsForEntitiesOn_Open_Records();
    cliResults = cliResults.concat(entititesResults);
    return cliResults;
}

const getCliVerbsForEntitiesOn_Open_Records = async () => {
    let entities: Array<CLIVerb> = await getCLIVerbsForEntitiesWrite();

    entities.forEach(x => {
        x.group = GROUP_NAME_OPEN_ENTITIES
        x.groupNumber = 20;
    });

    return entities;
}


export const getActionParamsForOpen = async (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];

    //Handle Special Cases Which rely on Target
    switch (cliDataVal.target) {

        case "entity": cliResults = cliResults.concat(CLI_ACTION_PARAMS_OPEN_GENERIC);

        case "view":
            break;

        case "new-record":
            break;

        case "entity-form":
            break;

        //Entity records
        default: cliResults = await getActionParams_Open_Records(userInput, cliDataVal);
            break;

    }

    return cliResults;
}

export const getActionParams_Open_Records = async (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];
    //To-Do add form as a parameter
    cliResults = cliResults.concat(CLI_ACTION_PARAMS_OPEN_RECORD);

    //Handle Entity Records here
    let entityMetadata: EntityMetadata = await getEntityMetadataBasic(cliDataVal.target);
    if (!entityMetadata)
        return cliResults;

    let attributes: Array<CLIVerb> = await getCliVerbsForAttributesOn_Open_Records(entityMetadata.LogicalName);

    cliResults = cliResults.concat(attributes);

    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);
    let verbsWhenPartialOrNoMatch = getNameVerbsPartialOrNoMatch(userInput, lastParam, cliResults);
    if (verbsWhenPartialOrNoMatch)
        return verbsWhenPartialOrNoMatch;

    //When Param Name has exact match the verbs are for the Param Value
    switch (lastParam?.name) {
        case "mode": cliResults = get_Open_Records_Modes_Verbs(lastParam);
            break;
    }

    return cliResults;

}


const get_Open_Records_Modes_Verbs = (lastParam: ActionParam) => {

    let properties = ["Classic", "UCI"];

    let cliResults: Array<CLIVerb> = [];
    properties.forEach(x => {
        let cliVerb: CLIVerb = { name: x, type: IntelliSenseType.ActionParamValue };
        cliResults.push(cliVerb);
    });

    cliResults = getFilteredVerbs(lastParam.value, cliResults);
    return cliResults;

}


const getCliVerbsForAttributesOn_Open_Records = async (entityLogicalName: string) => {
    let attributes: Array<CLIVerb> = await getCLIVerbsAttributes(entityLogicalName, IntelliSenseType.ActionParams, true);

    attributes.forEach(x => {
        x.group = GROUP_NAME_FILTER_ATTRIBUTES
        x.groupNumber = 20;
    });

    return attributes;
}