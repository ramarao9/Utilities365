import { CliData } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/GetTargetDefinitions"
import { CLI_ACTION_PARAMS_GET_RECORDS } from "../Definitions/GetActionParamsDefinitions"
import { getEntities, getEntity } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs, getCLIVerbsForEntities, getCLIVerbsForAttributes, getCLIVerbsForEntitiesWrite } from "../../../helpers/cliutil";
import { getEntityCollectionName } from "../../../helpers/metadatautil";

export const getTargetForCreate = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let targetName = cliDataVal.target;
    let entititesResults = await getCLIVerbsForEntitiesWrite();
    cliResults = cliResults.concat(entititesResults);

    if (targetName && targetName.length >= MINIMUM_CHARS_FOR_INTELLISENSE) {
        cliResults = cliResults.filter(x => x.name.toLowerCase().startsWith(targetName.toLowerCase()));
    }

    cliResults = getCleanedCLIVerbs(cliResults);
    return cliResults;
}


export const getActionsParamsForCreate = async (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];
    let entitySetName = cliDataVal.target;
    let entityMetadata = await getEntity(entitySetName) as EntityMetadata;
    cliResults = getCLIVerbsForAttributes(entityMetadata);

    let actionParams = cliDataVal.actionParams;

    if (!actionParams || actionParams.length === 0)
        return cliResults;

    //To do: tweak to look for last action param where the name is not empty
    let lastActionParam = actionParams[actionParams.length - 1];
    let paramName = lastActionParam && lastActionParam.name ? `${lastActionParam.name.toLowerCase()}` : null;

    if (paramName === null) {
        return cliResults;
    }

    if (paramName && paramName.length > 0) {//No param has been completely matched.In this case just filter the results
        cliResults = cliResults.filter(x => x.text!!.toLowerCase().startsWith(paramName!!));
    }

    return cliResults;
}