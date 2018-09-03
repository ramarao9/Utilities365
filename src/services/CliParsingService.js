
import IsEmpty from 'is-empty';

import { getDefaultParamName } from '../helpers/CLIDefaultActionParams';

const EMPTY_SPACE = " ";
const ACTION_PARAM_DELIMITER = "-";

function CliData(action, actionParams) {
    this.action = action
    this.actionParams = actionParams
}

function ActionParam(name, args) {
    this.name = name;
    this.args = args;
}

function ArgData(name, value) {
    this.name = name;
    this.value = value;
}


export function getCliData(userInput) {

    if (IsEmpty(userInput))
        return null;


    userInput = userInput.trim();

    const indexOfFirstSpace = userInput.indexOf(" ");
    const action = getAction(userInput, indexOfFirstSpace);

    const actionParamsStr = userInput.substr(indexOfFirstSpace);

    const actionParams = getActionParams(action, actionParamsStr);

    const cliData = new CliData(action, actionParams);

    return cliData;
}

function getAction(userInput, indexOfFirstSpace) {

    if (indexOfFirstSpace == -1)
        return userInput;

    const action = userInput.substring(0, indexOfFirstSpace);
    return action;
}

function getActionParams(actionName, actionParamsStr) {

    let actionsParams = [];

    const actionParamsDelimiter = actionParamsStr.indexOf(ACTION_PARAM_DELIMITER);

    if (actionParamsDelimiter == -1)//When only one single default argument is passed
    {
        const defaultParamName = getDefaultParamName(actionName);
        const defaultActionParam = getDefaultActionParam(defaultParamName, actionParamsStr);

        actionsParams.push(defaultActionParam);
        return actionsParams;
    }



    while (actionParamsDelimiter != -1) {

        actionParamsStr = actionParamsStr.trim();

        let currentParamData = null;
        const currentParamIndex = 1;

        const nextParamDelimiterIndex = actionParamsStr.substr(currentParamIndex).indexOf(ACTION_PARAM_DELIMITER);

        if (nextParamDelimiterIndex == -1) {
            currentParamData = actionParamsStr.substring(currentParamIndex).trim();
            actionParamsStr = actionParamsStr.substr(currentParamIndex);
        }
        else {
            currentParamData = actionParamsStr.substring(currentParamIndex, nextParamDelimiterIndex).trim();
            actionParamsStr = actionParamsStr.substr(nextParamDelimiterIndex);
        }

        const actionParam = getActionParam(currentParamData);
        if (actionParam != null) {
            actionsParams.push(actionParam);
        }


    }


    return actionsParams;
}


function getActionParam(paramData) {

    let paramArgs = [];
    let paramName = null;
    const indexOfFirstSpace = paramData.indexOf(EMPTY_SPACE)

    if (indexOfFirstSpace == -1) {
        paramName = paramData;
    }
    else {
        paramName = paramData.substring(0, indexOfFirstSpace);

        const argData = paramData.substr(indexOfFirstSpace);
        paramArgs = getArgs(argData);
    }

    const actionParam = new ActionParam(paramName, paramArgs);
    return actionParam;
}

function getArgs(argData) {
    let paramArgs = [];




    return paramArgs;
}

function getDefaultActionParam(paramName, paramValue) {
    const argData = new ArgData(null, paramValue);
    const actionParam = new ActionParam(paramName, [argData]);
    return actionParam;
}