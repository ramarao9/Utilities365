
import IsEmpty from 'is-empty';
const EMPTY_SPACE = " ";
const ACTION_PARAM_DELIMITER = "--";

function CliData(action, target, unnamedParam, actionParams, outputVariable, cliOutput) {
    this.action = action;//action like open, create, update etc.
    this.target = target;//Specify the Target component ex: entity, control etc.
    this.unnamedParam = unnamedParam;
    this.actionParams = actionParams;//Parameters needed for the action on the target
    this.outputVariable = outputVariable;
    this.cliOutput = cliOutput;
}

function ActionParam(name, value) {
    this.name = name;
    this.value = value;
}



export function getCliData(userInput) {

    if (IsEmpty(userInput))
        return null;

    userInput = userInput.trim();

    let outputVariableName = null;
    if (userInput.startsWith("$")) {//Let's assume if the userinput is $record=create account --name "ABC Corporation" we want to get the value into a variable called record.
        let indexOfEqualTo = userInput.indexOf("=");
        if (indexOfEqualTo != -1) {
            outputVariableName = userInput.subStr(0, indexOfEqualTo);
            userInput = userInput.replace(`${outputVariableName}=`, "");//in the above example this would remove the '$record=' from the string
            outputVariableName = outputVariableName.replace("$");//in the above example it would be record
        }
    }


    let action = getFirstSubStringbyDelimiter(EMPTY_SPACE, userInput);
    if (action == null) {
        action = userInput;
    }

    let actionParams = null;
    let unnamedParam = null;
    let cliOutput = null;
    let actionTarget=null;
    const indexOfFirstSpace = userInput.indexOf(EMPTY_SPACE);
    if (indexOfFirstSpace != -1) {
        const userInputWithoutAction = userInput.substr(indexOfFirstSpace).trim();
        actionTarget = getFirstSubStringbyDelimiter(EMPTY_SPACE, userInputWithoutAction);

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

  
        if (actionParams != null) {
            let indexOfOutputParam = actionParams.findIndex(x => x.name != null && x.name.toLowerCase() === "output");
            if (indexOfOutputParam != -1) {
                let outputParam = actionParams[indexOfOutputParam];
                cliOutput = { render: true };
                cliOutput.format = outputParam.value != null ? outputParam.value : "json";
                actionParams.splice(indexOfOutputParam, 1);
            }
        }

    }
    const cliData = new CliData(action, actionTarget, unnamedParam, actionParams, outputVariableName, cliOutput);
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
        const paramval = paramStr.substring(indexOfFirstSpace).replace(/["]+/g, "").trim();
        // const paramval = paramStr.substring(indexOfFirstSpace).trim();
        return new ActionParam(paramName, paramval);
    }
    );




    return actionsParams;
}


