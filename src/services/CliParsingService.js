
import IsEmpty from 'is-empty';
const EMPTY_SPACE = " ";
const ACTION_PARAM_DELIMITER = "--";

function CliData(action, target, unnamedParam, actionParams) {
    this.action = action;//action like open, create, update etc.
    this.target = target;//Specify the Target component ex: entity, control etc.
    this.unnamedParam = unnamedParam;
    this.actionParams = actionParams;//Parameters needed for the action on the target
}

function ActionParam(name, value) {
    this.name = name;
    this.value = value;
}



export function getCliData(userInput) {

    if (IsEmpty(userInput))
        return null;

    userInput = userInput.trim();

    const action = getFirstSubStringbyDelimiter(EMPTY_SPACE, userInput);

    const indexOfFirstSpace = userInput.indexOf(EMPTY_SPACE);
    const userInputWithoutAction = userInput.substr(indexOfFirstSpace).trim();

    let actionTarget = getFirstSubStringbyDelimiter(EMPTY_SPACE, userInputWithoutAction);
    let actionParams = null;
    let unnamedParam = null;
    if (actionTarget === null) {
        actionTarget = userInputWithoutAction // since there are no parameters
    }
    else {
        const indexOfSecondSpace = userInputWithoutAction.indexOf(EMPTY_SPACE);
        const actionParamsStr = userInputWithoutAction.substr(indexOfSecondSpace).trim();

        const actionParamsDelimiter = actionParamsStr.indexOf(ACTION_PARAM_DELIMITER);
        if (actionParamsDelimiter == -1)//When only one single parameter is passed
        {
            unnamedParam = actionParamsStr;
        }
        else {
            actionParams = getActionParams(actionParamsStr);
        }

    }

    const cliData = new CliData(action, actionTarget, unnamedParam, actionParams);
    return cliData;
}


function getFirstSubStringbyDelimiter(delimiter, strText) {
    const indexOfFirstDelimiter = strText.indexOf(delimiter);

    if (indexOfFirstDelimiter === -1)
        return null;

    const subStr = strText.substring(0, indexOfFirstDelimiter);
    return subStr;

}



function getActionParams(actionParamsStr) {

    let actionsParams = [];



    actionParamsStr = actionParamsStr.trim();

    let actionParamsSplit = actionParamsStr.split(ACTION_PARAM_DELIMITER);
    if (actionParamsSplit.length > 1) {
        actionParamsSplit.shift();
    }


    actionsParams = actionParamsSplit.map(paramStr => {
        const indexOfFirstSpace = paramStr.indexOf(EMPTY_SPACE);
        const paramName = getFirstSubStringbyDelimiter(EMPTY_SPACE, paramStr);
        const paramval = paramStr.substring(indexOfFirstSpace).trim();
        return new ActionParam(paramName, paramval);
    }
    );




    return actionsParams;
}


