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
import { number } from "prop-types";
const KEYCODE_UP = 38;
const KEYCODE_DOWN = 40;
const KEYCODE_ENTER = 13;


export const CLI: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputs, setOutputs] = useState<Array<any>>([]);
  const [commandsHistoryCurrentIndex, setCommandsHistoryCurrentIndex] = useState<number>(0);
  const [commandsHistory, setCommandsHistory] = useState<Array<string>>([]);

  const onTerminalInputKeyUp = async (ev: any) => {

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
    showActionResult(cliResponse);
  };



  const setCurrentCommandFromHistory = (keyCode: number) => {

    if (commandsHistory.length === 0)
      return;

    let updatedCommandsHistoryCurrentIndex = commandsHistoryCurrentIndex;
    if (keyCode == KEYCODE_UP) {
      updatedCommandsHistoryCurrentIndex = commandsHistory.length > 1 ? ++updatedCommandsHistoryCurrentIndex : 0;
    }
    else if (keyCode === KEYCODE_DOWN) {
      updatedCommandsHistoryCurrentIndex = commandsHistory.length > 1 ? --updatedCommandsHistoryCurrentIndex : 0;
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

  }

  const showActionResult = (cliResponse: CliResponse) => {
    const updatedOutputs = [...outputs];
    const updatedCommandsHistory = [...commandsHistory];

    var commandOut: TerminalOut = { type: "text", message: ">" + inputText };
    var commandResultOut: TerminalOut = {
      type: cliResponse.type,
      data: cliResponse.response,
      message: cliResponse.message
    };

    updatedOutputs.push(commandOut);
    updatedOutputs.push(commandResultOut);
    updatedCommandsHistory.push(inputText);

    setInputText("");
    setOutputs(updatedOutputs);
    setCommandsHistory(updatedCommandsHistory);
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
    <div>
      <h2>CLI</h2>

      <div className="terminalContainer">
        <Terminal
          outputs={outputs}
          terminalInputChange={(event: any) => onTerminalInputChanged(event)}
          terminalInputKeyUp={onTerminalInputKeyUp}
          inputText={inputText}
        />
      </div>
    </div>
  );
};
