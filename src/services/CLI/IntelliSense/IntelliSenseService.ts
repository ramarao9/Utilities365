import { CliData } from "../../../interfaces/CliData";
import { getCliData } from "../../CliParsingService";
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE, IntelliSenseInput } from "../../../interfaces/CliIntelliSense"
import { getTargetGetIntelliSense, getActionsParamsGetIntelliSense } from "../../../services/CLI/IntelliSense/GetIntelliSenseService"
import {
    CLI_ACTIONS, ACTION_ADD_NAME, ACTION_CREATE_NAME,
    ACTION_EXECUTE_NAME, ACTION_GET_NAME, ACTION_OPEN_NAME,
    ACTION_REMOVE_NAME, ACTION_UPDATE_NAME
} from "../Definitions/ActionDefinitions"
import { cursorTo } from "readline";
import { getCleanedCLIVerbs } from "../../../helpers/cliutil";



export const getIntelliSenseForText = async (intellisenseInput: IntelliSenseInput): Promise<CliIntelliSense> => {

    let inputText = intellisenseInput.inputText;


    let inputToUseForCLI = inputText.substring(0, intellisenseInput.inputCaretPosition);

    let intellisenseInfo: CliIntelliSense = { results: Array<CLIVerb>(), currentPos: { left: 0, top: 0 } };
    const cliDataVal = getCliData(inputToUseForCLI) as CliData;
    let intellisenseType = await getIntelliSenseType(inputToUseForCLI, cliDataVal);
    console.log(`Input to use for CLI: ${inputToUseForCLI}, Intellisense Type: ${intellisenseType}`);
    let cliVerbs: Array<CLIVerb> = [];

    switch (intellisenseType) {

        case IntelliSenseType.Action:
            cliVerbs = cliDataVal ? getActionsIntelliSense(cliDataVal.action) : getActionsIntelliSense("");
            break;

        case IntelliSenseType.Target:
            cliVerbs = await getTargetIntelliSense(cliDataVal);
            break;

        case IntelliSenseType.ActionParams:
            cliVerbs = await getParamsIntelliSense(inputToUseForCLI, cliDataVal);
            break;
    }

    if (cliVerbs && cliVerbs.length > 0) {
        intellisenseInfo.results = getCleanedCLIVerbs(cliVerbs);
    }


    return intellisenseInfo;
}



const getIntelliSenseType = async (inputText: string, cliData: CliData) => {

    if (!cliData)
        return IntelliSenseType.Action;

    let actionPopulated = isActionPopulated(cliData.action);
    let targetPopulated = await isTargetPopulated(inputText, cliData);

    if (!actionPopulated && !cliData.target && !cliData.actionParams) {
        return IntelliSenseType.Action;
    }
    else if (actionPopulated && !cliData.target && !inputText.endsWith(" ") && !targetPopulated && !cliData.actionParams) {
        return IntelliSenseType.None;
    }
    else if (actionPopulated && !targetPopulated && !cliData.actionParams) {
        return IntelliSenseType.Target;
    }
    else if (targetPopulated && !inputText.endsWith(" ") && !cliData.actionParams) {
        return IntelliSenseType.None;
    }
    else if (targetPopulated && (!cliData.actionParams || (cliData.actionParams && cliData.actionParams.length > 0))) {
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

//this method called when a Verb is Selected either by Click or Tab from the Intellisense Results
//Returns an updated user input with the new selection
export const getUpdatedInputOnSelection = (intellisenseInput: IntelliSenseInput, selectedVerb: CLIVerb): IntelliSenseInput => {



    let updatedInput = "";

    let currentInputText = intellisenseInput.inputText;
    const cliDataVal = getCliData(currentInputText) as CliData;
    let intellisenseType = selectedVerb && selectedVerb.type ? selectedVerb.type : getIntelliSenseType(currentInputText, cliDataVal);

    console.log(`IntelliSense Type - On Update Input after verb selection: ${intellisenseType}`);

    let inputCaretPos = intellisenseInput.inputCaretPosition;

    let textBeforeCaret = currentInputText.substring(0, inputCaretPos);
    let startIndexOfCurrentText = textBeforeCaret.lastIndexOf(" ") + 1;
    let textAfterCaret = currentInputText.substring(inputCaretPos);
    let endIndexOfCurrentText = textAfterCaret.indexOf(" ");

    if (endIndexOfCurrentText == -1) {
        endIndexOfCurrentText = currentInputText.length;
    }
    else {
        endIndexOfCurrentText = endIndexOfCurrentText + inputCaretPos;
    }

    let textToReplaceWith = selectedVerb.text ? selectedVerb.text : selectedVerb.name;
    updatedInput = replaceBetween(startIndexOfCurrentText, endIndexOfCurrentText, currentInputText, textToReplaceWith);


    let lenDiffOldAndNewText = updatedInput.length - currentInputText.length;

    let updatedIntelliSenseInput: IntelliSenseInput = { inputText: updatedInput, inputCaretPosition: inputCaretPos + lenDiffOldAndNewText };
    return updatedIntelliSenseInput;

    // switch (intellisenseType) {
    //     case IntelliSenseType.Action:
    //         updatedInput = selectedVerb ? `${selectedVerb.name}` : `${cliDataVal.action}`;
    //         break;

    //     case IntelliSenseType.Target: updatedInput = selectedVerb ? (`${cliDataVal.action} ${selectedVerb.text ? selectedVerb.text : selectedVerb.name}`) :
    //         `${cliDataVal.action} ${cliDataVal.target}`;
    //         break;

    //     case IntelliSenseType.ActionParams:
    //         updatedInput = selectedVerb ? `${currentInputText.trim()} ${selectedVerb.name}` : currentInputText;
    //         break;
    // }




}

const replaceBetween = function (start: number, end: number, textToReplace: string, replaceWith: string) {
    return textToReplace.substring(0, start) + replaceWith + textToReplace.substring(end);
};


const isActionPopulated = (action: string): boolean => {
    if (!action)
        return false;

    let matchingVerb = CLI_ACTIONS.find(x => x.name.toLowerCase() === action.toLowerCase());
    return (matchingVerb != null);
}


const isTargetPopulated = async (inputText: string, cliData: CliData) => {


    let action = cliData.action;

    if (!cliData.target)
        return false;


    if (cliData.actionParams && cliData.actionParams.length > 0)
        return true;

    let cliDataSplit = inputText.split(" ");
    if (cliDataSplit && cliDataSplit.length >= 3 &&
        cliDataSplit[0] === action) {
        return true;
    }

    let cliResults: Array<CLIVerb> = await getTargetIntelliSense(cliData);

    let target = cliData.target;
    let matchingVerbOnName = cliResults.find(x => x.name.toLowerCase() === target.toLowerCase());
    if (matchingVerbOnName != null) {
        return true;
    }

    let matchingVerbOnText = cliResults.find(x => x.text && x.text.toLowerCase() === target.toLowerCase());
    return (matchingVerbOnText != null);


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

    let actionsParams = cliDataVal.actionParams;

    if (actionsParams && actionsParams.length > 0 && cliResults.length > 0) {
        cliResults = cliResults.filter(x =>x.name && actionsParams && actionsParams.findIndex(y => y.name === x.name.replace("--","")) === -1);
    }



    return cliResults;

}