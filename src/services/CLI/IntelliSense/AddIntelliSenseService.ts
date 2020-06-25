import { CliData } from "../../../interfaces/CliData";
import { CLIVerb } from "../../../interfaces/CliIntelliSense"
import { CLI_ACTION_PARAMS_ADD_ROLE } from "../Definitions/ActionParams/Add";
import { CLI_TARGET_ADD } from "../Definitions/Target/Add";


export const getTargetForAdd =  (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    cliResults = cliResults.concat(CLI_TARGET_ADD);//Default targets
    return cliResults;
}

export const getActionParamsForAdd = (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];

    switch (cliDataVal.target) {

        case "role": cliResults = cliResults.concat(CLI_ACTION_PARAMS_ADD_ROLE);
            break;
    }

    return cliResults;
}

