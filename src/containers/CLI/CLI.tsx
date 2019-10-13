import React, { FunctionComponent, useState } from "react";
import { Redirect } from "react-router";
import store from "../../store/store";
import * as crmUtil from "../../helpers/crmutil";
import * as actionTypes from "../../store/actions";
import IsEmpty from "is-empty";
import { getCliData } from "../../services/CliParsingService";
import { PerformCrmAction } from "../../services/CLI/CrmCliService";
import { Terminal } from "../../components/UI/Terminal/Terminal";
import { CliResponse } from "../../interfaces/CliResponse";
import { CliData } from "../../interfaces/CliData";
import { TerminalOut } from "../../interfaces/TerminalOut";
import "./CLI.css";
import { number } from "prop-types";
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;


export const CLI: React.FC = () => {
  const [variables, setVariables] = useState<any>({});
  const [inputText, setInputText] = useState<string>("");
  const [outputs, setOutputs] = useState<Array<any>>([]);
  const [commandsHistoryCurrentIndex, setCommandsHistoryCurrentIndex] = useState<number>(-1);
  const [commandsHistory, setCommandsHistory] = useState<Array<string>>([]);

  const onTerminalInputKeyDown = async (ev: any) => {

    if (ev.keyCode === KEYCODE_UP || ev.keyCode === KEYCODE_DOWN) {
      setCurrentCommandFromHistory(ev.keyCode);
      return;
    }

    if (ev.keyCode !== KEYCODE_ENTER) return;

    const cliDataVal = getCliData(inputText) as CliData;
    let cliResponse: CliResponse = { type: "", success: false, message: "" };

    if (cliDataVal.action != null) {//special cases
      switch (cliDataVal.action.toLowerCase()) {

        case "cls":
        case "clear": clearTerminal();
          return;



      }
    }

    cliResponse = await PerformCrmAction(cliDataVal);
    showActionResult(cliResponse, cliDataVal);
  };



  const setCurrentCommandFromHistory = (keyCode: number) => {

    let commandsHistoryArrLength = commandsHistory.length;

    if (commandsHistoryArrLength === 0)
      return;

    let updatedCommandsHistoryCurrentIndex = commandsHistoryCurrentIndex;
    if (keyCode === KEYCODE_DOWN) {
      updatedCommandsHistoryCurrentIndex = (updatedCommandsHistoryCurrentIndex + 1 >= commandsHistoryArrLength) ?
        commandsHistoryArrLength - 1 :
        ++updatedCommandsHistoryCurrentIndex;
    }
    else if (keyCode === KEYCODE_UP) {
      updatedCommandsHistoryCurrentIndex = (inputText === "") ? commandsHistoryArrLength - 1 :
        ((updatedCommandsHistoryCurrentIndex === 0) ? 0 : --updatedCommandsHistoryCurrentIndex);
    }

    let updatedInputText = commandsHistory[updatedCommandsHistoryCurrentIndex];
    setInputText(updatedInputText);
    setCommandsHistoryCurrentIndex(updatedCommandsHistoryCurrentIndex);
  }


  const performCLIAction = async () => {

  }

  const clearTerminal = () => {
    setInputText("");
    setOutputs([]);
    setVariables({});
  }

  const showActionResult = (cliResponse: CliResponse, cliData: CliData) => {
    const updatedOutputs = [...outputs];
    const updatedCommandsHistory = [...commandsHistory];

    var commandOut: TerminalOut = { type: "text", message: ">" + inputText };
    var commandResultOut: TerminalOut = {
      type: cliResponse.type,
      data: cliResponse.response,
      message: cliResponse.message
    };

    if (cliData.cliOutput != null && cliData.cliOutput.render) {
      commandResultOut.type = cliData.cliOutput.format;
    }


    let updatedVariables = { ...variables };
    if (cliData.outputVariable) {
      updatedVariables[cliData.outputVariable] = cliResponse.response;
    }
    else {
      updatedVariables["result"] = cliResponse.response;
    }




    updatedOutputs.push(commandOut);
    updatedOutputs.push(commandResultOut);
    updatedCommandsHistory.push(inputText);


    setInputText("");
    setOutputs(updatedOutputs);
    setVariables(updatedVariables);
    setCommandsHistory(updatedCommandsHistory);
    setCommandsHistoryCurrentIndex(updatedCommandsHistory.length - 1);

  };


  const onTerminalInputChanged = (ev: any) => {
    const userInput = ev.target.value;

    setInputText(userInput);
  };

  const addTextToOutput = (outputText: string) => {
    const updatedOutputs = [...outputs];
    updatedOutputs.push(outputText);
    setOutputs(updatedOutputs);
  };



  const storeData = store.getState();
  if (!crmUtil.isValidToken(storeData.tokenData)) {
    return <Redirect to="/" />;
  }

  return (
    <React.Fragment>
    <h2>CLI </h2>
    <div className="terminalContainer">
      <Terminal
          outputs={outputs}
  terminalInputChange={(event: any) => onTerminalInputChanged(event)}
terminalInputKeyDown={onTerminalInputKeyDown}
inputText={inputText} />
  </div>
  </React.Fragment>
  );
};