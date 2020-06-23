import { CliData } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/GetTargetDefinitions"
import { CLI_ACTION_PARAMS_GET_RECORDS } from "../Definitions/GetActionParamsDefinitions"
import { getEntities } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs, getCLIVerbsForEntities } from "../../../helpers/cliutil";
import { getEntityCollectionName } from "../../../helpers/metadatautil";

export const getTargetForGet = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let targetName = cliDataVal.target;
    let entititesResults = await getCLIVerbsForEntities();
    cliResults = cliResults.concat(CLI_TARGET_GET);//Default targets
    cliResults = cliResults.concat(entititesResults);


    if (targetName && targetName.length >= MINIMUM_CHARS_FOR_INTELLISENSE) {
        cliResults = cliResults.filter(x => x.name.toLowerCase().startsWith(targetName.toLowerCase()));
    }

    cliResults = getCleanedCLIVerbs(cliResults);

    return cliResults;
}




export const getActionParamsForGet = async (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.target) {

        case "entity":
            break;

        case "entities":
            break;


        case "attribute":
        case "attributes":
            break;


        case "org-detail":
            break;

        //Get records 
        default: cliResults = await getCurrentActionParamVerbsForRecords(userInput, cliDataVal) as Array<CLIVerb>;
            break;
    }

    return cliResults;
}


//Retrieves the CLI Verbs for either the parameter itself or for the data that needs to be set for the parameter
const getCurrentActionParamVerbsForRecords = async (userInput: string, cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let actionParams = cliDataVal.actionParams;

    if (!actionParams || actionParams.length === 0)
        return CLI_ACTION_PARAMS_GET_RECORDS;

    let lastActionParam = actionParams[actionParams.length - 1];
    let paramName = lastActionParam && lastActionParam.name ? `${lastActionParam.name.toLowerCase()}` : null;

    if (paramName === null) {
        return CLI_ACTION_PARAMS_GET_RECORDS;
    }

    let paramMatched = paramName ? CLI_ACTION_PARAMS_GET_RECORDS.find(x => x.name.toLowerCase() === paramName) : null;
    let paramValue = lastActionParam.value;
    if (paramMatched) {//When the Param name is already populated, this indicates we need to provide the Verbs for the data present in the value
        cliResults = await getVerbsForODataQueryOptions(paramValue) as Array<CLIVerb>;
    }
    else if (paramName && paramName.length > 0) {//No param has been completely matched.In this case just filter the results
        cliResults = CLI_ACTION_PARAMS_GET_RECORDS.filter(x => x.name.toLowerCase().startsWith(paramName!!));
    }

    return cliResults;
}


const getVerbsForODataQueryOptions = async (paramValue: string) => {

    let cliResults: Array<CLIVerb> = [];


    //identify if the param is top, filter or select and identify what dynamics verb results need to be shown


    return cliResults;


}