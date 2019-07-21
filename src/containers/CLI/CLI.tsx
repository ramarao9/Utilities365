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
import { TerminalOut } from "../../interfaces/TerminalOut";
export const CLI: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [outputs, setOutputs] = useState<Array<any>>([]);

  const onTerminalInputKeyUp = async (ev: any) => {
    if (ev.keyCode !== 13) return;

    const cliData = getCliData(inputText);
    let cliResponse: CliResponse = { type: "", success: false, message: "" };

    cliResponse = await PerformCrmAction(cliData);

    showActionResult(cliResponse);
  };

  const onTerminalInputChanged = (ev: any) => {
    const userInput = ev.target.value;

    setInputText(userInput);
  };

  const showActionResult = (cliResponse: CliResponse) => {
    const updatedOutputs = [...outputs];

    var commandOut: TerminalOut = { type: "text", message: ">" + inputText };
    var commandResultOut: TerminalOut = {
      type: cliResponse.type,
      data: cliResponse.response,
      message: cliResponse.message
    };

    updatedOutputs.push(commandOut);
    updatedOutputs.push(commandResultOut);

    setInputText("");
    setOutputs(updatedOutputs);
  };

  const addTextToOutput = (outputText: string) => {
    const updatedOutputs = [...outputs];
    updatedOutputs.push(outputText);
    setOutputs(updatedOutputs);
  };

  const clearInputText = () => {
    setInputText("");
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
