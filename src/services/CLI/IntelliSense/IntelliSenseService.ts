import { CliData, ActionParam } from "../../../interfaces/CliData";
import { getCliData } from "../../CliParsingService";
import { CliIntelliSense, IntelliSenseType, CLIVerb, MINIMUM_CHARS_FOR_INTELLISENSE, IntelliSenseInput } from "../../../interfaces/CliIntelliSense"
import { getTargetForGet, getActionParamsForGet } from "../../../services/CLI/IntelliSense/GetIntelliSenseService"
import {
    CLI_ACTIONS, ACTION_ADD_NAME, ACTION_CREATE_NAME,
    ACTION_EXECUTE_NAME, ACTION_GET_NAME, ACTION_OPEN_NAME,
    ACTION_REMOVE_NAME, ACTION_UPDATE_NAME
} from "../Definitions/ActionDefinitions"
import { cursorTo } from "readline";
import { getCleanedCLIVerbs, getEntityCLIVerbs, getLastParam } from "../../../helpers/cliutil";
import { getActionsParamsForWrite } from "./WriteIntelliSenseService";
import { CRMOperation } from "../../../interfaces/CRMOperation";
import { getTargetForOpen, getActionParamsForOpen } from "./OpenIntelliSenseService";
import { getActionParamsForAdd, getTargetForAdd } from "./AddIntelliSenseService";
import { getActionParamsForRemove, getTargetForRemove } from "./RemoveIntelliSenseService";
import { currentParamHasValue } from "../../../helpers/cliutil";


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


    if (!actionPopulated && !cliData.target && !cliData.actionParams) {
        return IntelliSenseType.Action;
    }

    let targetPopulated = await isTargetPopulated(inputText, cliData);
    if (actionPopulated && !cliData.target && !inputText.endsWith(" ") && !targetPopulated && !cliData.actionParams) {
        return IntelliSenseType.None;
    }
    else if (actionPopulated && !targetPopulated && !cliData.actionParams) {
        return IntelliSenseType.Target;
    }
    else if (targetPopulated && !inputText.endsWith(" ") && !cliData.actionParams) {
        return IntelliSenseType.None;
    }

    let lastActionParam = getLastParam(cliData);
    let actionParamsPopulated = await isLastActionParamsPopulated(inputText, cliData);
    if (actionParamsPopulated) {
        return IntelliSenseType.None;
    }
    if (targetPopulated && (!cliData.actionParams || (cliData.actionParams && cliData.actionParams.length > 0))) {
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
export const getUpdatedInputOnSelection = async (intellisenseInput: IntelliSenseInput, selectedVerb: CLIVerb): Promise<IntelliSenseInput> => {



    let updatedInput = "";

    let currentInputText = intellisenseInput.inputText;
    const cliDataVal = getCliData(currentInputText) as CliData;
    let intellisenseType = selectedVerb && selectedVerb.type ? selectedVerb.type : await getIntelliSenseType(currentInputText, cliDataVal);

    if (intellisenseType === IntelliSenseType.None) {

        return intellisenseInput;
    }


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



    const cliDataForCurrentPos = getCliData(textBeforeCaret) as CliData;
    let intellisenseTypeCurrentPos = await getIntelliSenseType(textBeforeCaret, cliDataForCurrentPos);
    let lastParamForCurrentPos = getLastParam(cliDataForCurrentPos);


    let textToReplaceWith = selectedVerb.text ? selectedVerb.text : selectedVerb.name;

    if (lastParamForCurrentPos && lastParamForCurrentPos.value &&
        selectedVerb.type === IntelliSenseType.ActionParamValue) {
        textToReplaceWith = lastParamForCurrentPos.value + textToReplaceWith;//Handles special case when the param values have csv or other formats of data
    }

    if (intellisenseTypeCurrentPos === IntelliSenseType.ActionParams &&
        selectedVerb.type !== IntelliSenseType.ActionParamValue) {

        //e.g. when selection for --entity param is made and when user inputis 'get entity '
        //e.g. when selection for --entity param is made and when user inputis 'get entity ent'
        if (!lastParamForCurrentPos ||
            (selectedVerb.type && selectedVerb.type == IntelliSenseType.ActionParams) ||
            (lastParamForCurrentPos && !lastParamForCurrentPos.value && !currentInputText.endsWith(" "))) {
            textToReplaceWith = "--" + textToReplaceWith;
        }
    }
    updatedInput = replaceBetween(startIndexOfCurrentText, endIndexOfCurrentText, currentInputText, textToReplaceWith);


    let lenDiffOldAndNewText = updatedInput.length - currentInputText.length;

    let updatedIntelliSenseInput: IntelliSenseInput = { inputText: updatedInput, inputCaretPosition: inputCaretPos + lenDiffOldAndNewText };
    return updatedIntelliSenseInput;


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


const isLastActionParamsPopulated = async (inputText: string, cliData: CliData) => {


    let lastActionParam = getLastParam(cliData);

    if (lastActionParam == null || lastActionParam === undefined)
        return false;

    let cliResults: Array<CLIVerb> = await getParamsIntelliSense(inputText, cliData);


    //If the parameter doesn't have a value than check to see if the Verb matches
    let matchingVerbNameOnName = !lastActionParam.value ?
        cliResults.find(x => x.name.toLowerCase() === lastActionParam!!.name.toLowerCase()) : null;
    if (matchingVerbNameOnName != null) {
        return true;
    }

    let matchingVerbNameOnText = !lastActionParam.value ?
        cliResults.find(x => x.text && x.text.toLowerCase() === lastActionParam!!.name.toLowerCase()) : null;
    return (matchingVerbNameOnText != null);

}


const getTargetIntelliSense = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.action) {
        case ACTION_ADD_NAME: cliResults = getTargetForAdd(cliDataVal);
            break;

        case ACTION_CREATE_NAME:
        case ACTION_UPDATE_NAME: cliResults = await getEntityCLIVerbs();
            break;

        case ACTION_EXECUTE_NAME:
            break;

        case ACTION_GET_NAME: cliResults = await getTargetForGet(cliDataVal);
            break;

        case ACTION_OPEN_NAME: cliResults = await getTargetForOpen(cliDataVal);
            break;

        case ACTION_REMOVE_NAME: cliResults = getTargetForRemove(cliDataVal);
            break;

    }

    let targetName = cliDataVal.target;
    if (targetName && targetName.length >= MINIMUM_CHARS_FOR_INTELLISENSE) {
        cliResults = cliResults.filter(x => x.name.toLowerCase().startsWith(targetName.toLowerCase()) ||
            x.text && x.text.toLowerCase().startsWith(targetName.toLowerCase()));
    }

    return cliResults;
}


const getParamsIntelliSense = async (userInput: string, cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    switch (cliDataVal.action) {
        case ACTION_ADD_NAME: cliResults = getActionParamsForAdd(userInput, cliDataVal);
            break;

        case ACTION_CREATE_NAME: cliResults = await getActionsParamsForWrite(userInput, cliDataVal, CRMOperation.Create);
            break;

        case ACTION_UPDATE_NAME: cliResults = await getActionsParamsForWrite(userInput, cliDataVal, CRMOperation.Update);
            break;

        case ACTION_EXECUTE_NAME:
            break;

        case ACTION_GET_NAME: cliResults = await getActionParamsForGet(userInput, cliDataVal);
            break;

        case ACTION_OPEN_NAME: cliResults = getActionParamsForOpen(userInput, cliDataVal);
            break;

        case ACTION_REMOVE_NAME: cliResults = getActionParamsForRemove(userInput, cliDataVal);
            break;
    }

    let actionsParams = cliDataVal.actionParams;
    let lastActionParam = getLastParam(cliDataVal);
    if (lastActionParam && (lastActionParam.value || userInput.endsWith(" "))) {// when the param name has data but not the  value just show the avilable results
        return cliResults; // Since each case could be unique we just return the values and each operation handles the best way to show these results
    }
    //if the action parameter has value than filter on the parameter values from the Cli results
    else if (lastActionParam && lastActionParam.name && !lastActionParam.value) {//Require filter on the value of the parameter
        cliResults = cliResults.filter(x => x.name.toLowerCase().startsWith(lastActionParam!!.name.toLowerCase()));
    }

    //filter on the name of the parameter
    else if (actionsParams && actionsParams.length > 0 && cliResults.length > 0) {
        cliResults = cliResults.filter(x => x.name && actionsParams && actionsParams.findIndex(y => y.name === x.name.replace("--", "")) === -1);
    }

    return cliResults;

}