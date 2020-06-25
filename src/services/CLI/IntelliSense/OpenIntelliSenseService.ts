import { CliData } from "../../../interfaces/CliData";
import { CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { getCLIVerbsForEntitiesWrite } from "../../../helpers/cliutil";
import { CLI_TARGET_OPEN } from "../Definitions/Target/Open";
import { CLI_ACTION_PARAMS_OPEN_ENTITY } from "../Definitions/ActionParams/Open";


export const getTargetForOpen = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    cliResults = cliResults.concat(CLI_TARGET_OPEN);//Default targets
    let entititesResults = await getCLIVerbsForEntitiesWrite();
    cliResults = cliResults.concat(entititesResults);
    return cliResults;
}

export const getActionParamsForOpen = (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];

    switch (cliDataVal.target) {

        case "entity": cliResults = cliResults.concat(CLI_ACTION_PARAMS_OPEN_ENTITY);
            break;
    }

    return cliResults;
}

