import { CliData } from "../../../interfaces/CliData";
import { CLIVerb } from "../../../interfaces/CliIntelliSense";
import { CLI_TARGET_EXECUTE } from "../Definitions/Target/Execute";

export const getTargetForExecute =  (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    cliResults = cliResults.concat(CLI_TARGET_EXECUTE);//Default targets
    return cliResults;
}