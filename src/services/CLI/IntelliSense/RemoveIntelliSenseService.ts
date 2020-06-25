import { CliData } from "../../../interfaces/CliData";
import { CLIVerb } from "../../../interfaces/CliIntelliSense"
import { CLI_TARGET_REMOVE } from "../Definitions/Target/Remove";
import { CLI_ACTION_PARAMS_REMOVE_ROLE } from "../Definitions/ActionParams/Remove";


export const getTargetForRemove =  (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    cliResults = cliResults.concat(CLI_TARGET_REMOVE);//Default targets
    return cliResults;
}

export const getActionParamsForRemove = (userInput: string, cliDataVal: CliData) => {
    let cliResults: Array<CLIVerb> = [];

    switch (cliDataVal.target) {

        case "role": cliResults = cliResults.concat(CLI_ACTION_PARAMS_REMOVE_ROLE);
            break;
    }

    return cliResults;
}

