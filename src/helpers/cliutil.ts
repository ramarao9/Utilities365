import { CLIVerb } from "../interfaces/CliIntelliSense";

export const getCleanedCLIVerbs=(cliVerbs:Array<CLIVerb>):Array<CLIVerb>=>{


    cliVerbs = cliVerbs.map((x) => {
        x.isSelected = false;
        return x;
    });

    if (cliVerbs.length > 0) {
        cliVerbs[0].isSelected = true;
    }


    return cliVerbs;
}