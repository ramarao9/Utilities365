import { CliData } from "../../../interfaces/CliData";
import { getCliData } from "../../CliParsingService";
import { CliIntelliSense, IntelliSenseType, CLIVerb } from "../../../interfaces/CliIntelliSense"
import {getTargetGetIntelliSense} from "../../../services/CLI/IntelliSense/GetIntelliSenseService"
import {
    CLI_ACTIONS, ACTION_ADD_NAME, ACTION_CREATE_NAME,
    ACTION_EXECUTE_NAME, ACTION_GET_NAME, ACTION_OPEN_NAME,
    ACTION_REMOVE_NAME, ACTION_UPDATE_NAME
} from "../Definitions/ActionDefinitions"
import { cursorTo } from "readline";

const MINIMUM_CHARS_FOR_INTELLISENSE: number = 1;

export const getIntelliSenseForText = async (inputText: string): Promise<CliIntelliSense> => {

    console.log(inputText);
    let intellisenseInfo = { results: Array<CLIVerb>(), currentIndex: 0 };
    const cliDataVal = getCliData(inputText) as CliData;
    let intellisenseType = getIntelliSenseType(cliDataVal);


    switch (intellisenseType) {

        case IntelliSenseType.Action:
            intellisenseInfo.results = cliDataVal ? getActionsIntelliSense(cliDataVal.action) : getActionsIntelliSense("");
            break;

        case IntelliSenseType.Target:
            intellisenseInfo.results=await getTargetIntelliSense(cliDataVal);
            intellisenseInfo.currentIndex = cliDataVal.action.length;
            break;

        case IntelliSenseType.ActionParams:
            break;
    }

    return intellisenseInfo;
}



const getIntelliSenseType = (cliData: CliData): IntelliSenseType => {

    if (!cliData)
        return IntelliSenseType.Action;


    let actionPopulated = isActionPopulated(cliData.action);

    if (cliData.action && !actionPopulated && !cliData.target && !cliData.actionParams) {
        return IntelliSenseType.Action;
    }
    else if (cliData.action && actionPopulated && !cliData.actionParams) {
        return IntelliSenseType.Target;
    }
    else if (cliData.action && cliData.target && cliData.actionParams) {
        return IntelliSenseType.ActionParams;
    }
    else {
        return IntelliSenseType.None;
    }
}

const getActionsIntelliSense = (actionSubStr: string): Array<CLIVerb> => {

    let cliResults: Array<CLIVerb> = [];
    if (actionSubStr && actionSubStr.length >= MINIMUM_CHARS_FOR_INTELLISENSE) {
        cliResults = CLI_ACTIONS.filter(x => x.name.toLowerCase().startsWith(actionSubStr.toLowerCase()));
    }
    else {
        cliResults = CLI_ACTIONS;
    }



    if (cliResults.length > 0) {
        cliResults[0].isSelected = true;
    }
    return cliResults;
}


export const getUpdatedInputOnSelection = (currentInputText: string, selectedVerb: CLIVerb): string => {

    let updatedInput = "";

    const cliDataVal = getCliData(currentInputText) as CliData;
    let intellisenseType = getIntelliSenseType(cliDataVal);


    switch (intellisenseType) {

        case IntelliSenseType.Action:
            updatedInput = `${selectedVerb.name} `;
            break;

        case IntelliSenseType.Target:
            break;

        case IntelliSenseType.ActionParams:
            break;
    }

    return updatedInput;


}


const isActionPopulated = (action: string): boolean => {
    if (!action)
        return false;

    let matchingVerb = CLI_ACTIONS.find(x => x.name.toLowerCase() === action.toLowerCase());
    return (matchingVerb != null);
}


const getTargetIntelliSense = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.action) {
        case ACTION_ADD_NAME:
            break;

        case ACTION_CREATE_NAME:
            break;

        case ACTION_EXECUTE_NAME:
            break;

        case ACTION_GET_NAME:cliResults=await getTargetGetIntelliSense(cliDataVal);
            break;

        case ACTION_OPEN_NAME:
            break;

        case ACTION_REMOVE_NAME:
            break;

        case ACTION_UPDATE_NAME:
            break;
    }
    return cliResults;
}