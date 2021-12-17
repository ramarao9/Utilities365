import { CliData } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/Target/Get"
import { CLI_ACTION_PARAMS_GET_RECORDS } from "../Definitions/ActionParams/Get"
import { getEntities, getEntity } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs, getCLIVerbsForEntities, getCLIVerbsForAttributes, getCLIVerbsForEntitiesWrite, getEntityCLIVerbs } from "../../../helpers/cliutil";
import { getEntityCollectionName } from "../../../helpers/metadatautil";
import { CRMOperation } from "../../../interfaces/CRMOperation";
import { CLI_ACTION_PARAMS_UPDATE_RECORDS } from "../Definitions/ActionParams/Update";



export const getActionsParamsForWrite = async (userInput: string, cliDataVal: CliData, crmOperation: CRMOperation) => {
    let cliResults: Array<CLIVerb> = [];
    let entitySetName = cliDataVal.target;
    let entityMetadata = await getEntity(entitySetName) as EntityMetadata;

    if (crmOperation === CRMOperation.Update) {
        cliResults = cliResults.concat(CLI_ACTION_PARAMS_UPDATE_RECORDS);//Default targets
    }

    let attributeVerbs = getCLIVerbsForAttributes(entityMetadata, undefined, undefined, true);
    cliResults = cliResults.concat(attributeVerbs);

    let actionParams = cliDataVal.actionParams;

    if (!actionParams || actionParams.length === 0)
        return cliResults;

    let lastActionParam = actionParams[actionParams.length - 1];

    let paramName = lastActionParam && lastActionParam.name ? `${lastActionParam.name.toLowerCase()}` : null;
    let populatedActionParams = actionParams.filter(x => x.name && x.value && x.name !== paramName);

    //Remove the previously populated items
    cliResults = cliResults.filter(x => {
        return populatedActionParams.findIndex(y => y.name === x.text) === -1;
    });

    if (paramName === null) {
        return cliResults;
    }

    if (paramName && paramName.length > 0) {//No param has been completely matched.In this case just filter the results
        cliResults = cliResults.filter(x => (x.text && x.text!!.toLowerCase().startsWith(paramName!!)) ||
            x.name.toLowerCase().startsWith(paramName!!));
    }

    return cliResults;
}