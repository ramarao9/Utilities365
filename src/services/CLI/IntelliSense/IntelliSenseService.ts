import { CliData } from "../../../interfaces/CliData";
import { getCliData } from "../../CliParsingService";
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE } from "../../../interfaces/CliIntelliSense"
import { getTargetGetIntelliSense, getActionsParamsGetIntelliSense } from "../../../services/CLI/IntelliSense/GetIntelliSenseService"
import {
    CLI_ACTIONS, ACTION_ADD_NAME, ACTION_CREATE_NAME,
    ACTION_EXECUTE_NAME, ACTION_GET_NAME, ACTION_OPEN_NAME,
    ACTION_REMOVE_NAME, ACTION_UPDATE_NAME
} from "../Definitions/ActionDefinitions"
import { cursorTo } from "readline";
import { getCleanedCLIVerbs } from "../../../helpers/cliutil";



export const getIntelliSenseForText = async (inputText: string): Promise<CliIntelliSense> => {

    console.log(inputText);
    let intellisenseInfo: CliIntelliSense = { results: Array<CLIVerb>(), currentPos: { left: 0, top: 0 } };
    const cliDataVal = getCliData(inputText) as CliData;
    let intellisenseType = getIntelliSenseType(inputText, cliDataVal);
    let cliVerbs: Array<CLIVerb> = [];

    switch (intellisenseType) {

        case IntelliSenseType.Action:
            cliVerbs = cliDataVal ? getActionsIntelliSense(cliDataVal.action) : getActionsIntelliSense("");
            break;

        case IntelliSenseType.Target:
            cliVerbs = await getTargetIntelliSense(cliDataVal);
            break;

        case IntelliSenseType.ActionParams:
            cliVerbs = await getParamsIntelliSense(inputText, cliDataVal);
            break;
    }

    if (cliVerbs && cliVerbs.length > 0) {
        intellisenseInfo.results = getCleanedCLIVerbs(cliVerbs);
    }


    return intellisenseInfo;
}



const getIntelliSenseType = (inputText: string, cliData: CliData): IntelliSenseType => {

    if (!cliData)
        return IntelliSenseType.Action;

    let actionPopulated = isActionPopulated(cliData.action);
    let targetPopulated = isTargetPopulated(inputText, cliData);

    if (!actionPopulated && !cliData.target && !cliData.actionParams) {
        return IntelliSenseType.Action;
    }
    else if (actionPopulated && !targetPopulated && !cliData.actionParams) {
        return IntelliSenseType.Target;
    }
    else if (targetPopulated && (!cliData.actionParams || (cliData.actionParams && cliData.actionParams.length>0) )) {
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


    return cliResults;
}


export const getUpdatedInputOnSelection = (currentInputText: string, selectedVerb: CLIVerb | undefined): string => {

    let updatedInput = "";

    const cliDataVal = getCliData(currentInputText) as CliData;
    let intellisenseType = selectedVerb && selectedVerb.type ? selectedVerb.type : getIntelliSenseType(currentInputText, cliDataVal);


    switch (intellisenseType) {
        case IntelliSenseType.Action:
            updatedInput = selectedVerb ? `${selectedVerb.name} ` : `${cliDataVal.action} `;
            break;

        case IntelliSenseType.Target: updatedInput = selectedVerb ? (`${cliDataVal.action} ${selectedVerb.text ? selectedVerb.text : selectedVerb.name} `) :
            `${cliDataVal.action} ${cliDataVal.target} `;
            break;

        case IntelliSenseType.ActionParams:
            updatedInput = selectedVerb ? `${currentInputText.trim()} ${selectedVerb.name} ` : currentInputText;
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


const isTargetPopulated = (inputText: string, cliData: CliData): boolean => {


    let action = cliData.action;

    if (!cliData.target)
        return false;


    if (cliData.actionParams && cliData.actionParams.length > 0)
        return true;

    let cliDataSplit = inputText.split(" ");
    return (cliDataSplit && cliDataSplit.length >= 3 &&
        cliDataSplit[0] === action);

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

        case ACTION_GET_NAME: cliResults = await getTargetGetIntelliSense(cliDataVal);
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


const getParamsIntelliSense = async (userInput: string, cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.action) {
        case ACTION_ADD_NAME:
            break;

        case ACTION_CREATE_NAME:
            break;

        case ACTION_EXECUTE_NAME:
            break;

        case ACTION_GET_NAME: cliResults = await getActionsParamsGetIntelliSense(userInput, cliDataVal);
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