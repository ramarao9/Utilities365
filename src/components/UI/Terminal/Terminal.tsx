import React, { KeyboardEventHandler } from "react";
import "./Terminal.css";
import { TerminalInput } from "./TerminalInput/TerminalInput";
import { TerminalOut } from "../../../interfaces/TerminalOut";
import { terminalOutput as TerminalOutput } from "./TerminalOutput/TerminalOutput";
import { Spinner } from "../../../interfaces/Spinner";
import { SpinIcon } from "../SpinIcon/SpinIcon";
import { CliIntelliSense, CLIVerb } from "../../../interfaces/CliIntelliSense"
import { CliResponse, CliResponseType } from "../../../interfaces/CliResponse";
import { CliInput } from "../../../interfaces/CliInput";

interface TerminalProp {
  outputs: Array<CliResponse>;
  intelliSenseResults: CliIntelliSense;
  terminalInputChange: any;
  terminalInputKeyDown: any;
  terminalInputKeyPress?: any;
  terminalInputBlur?(e: any): void;
  terminalIntelliSenseItemClick(e: any, resultItem: CLIVerb): void;
  terminalAdditionalInputChange(e:React.ChangeEvent<HTMLTextAreaElement>):void
  terminalAdditionalInputKeyDown(e: React.KeyboardEvent<HTMLElement> | undefined): void;
  cliInput: CliInput;
  spinner: Spinner;
  terminalInputRef: any;
}

export const Terminal: React.FC<TerminalProp> = (terminalProp: TerminalProp) => {
  let terminalOutputs = null;
  let requestingUserInput = false;
  if (terminalProp.outputs != null && terminalProp.outputs.length > 0) {
    terminalOutputs = terminalProp.outputs.map((x, index) => (


      <TerminalOutput key={index} message={x.message} type={x.type} response={x.response} success={true} userInputMessage={x.userInputMessage} />
    ));

    requestingUserInput = terminalProp.outputs.some(x => x.type === CliResponseType.RequestAdditionalUserInput);
  }

  let spinnerControl = null;
  if (terminalProp.spinner && terminalProp.spinner.show) {
    spinnerControl = (<SpinIcon show={terminalProp.spinner.show} />);
  }

  let terminalInput = null;
  if (!requestingUserInput) {
    terminalInput=(<TerminalInput
      onInputChange={terminalProp.terminalInputChange}
      onInputKeyDown={terminalProp.terminalInputKeyDown}
      onInputKeyPress={terminalProp.terminalInputKeyPress}
      onInputBlur={terminalProp.terminalInputBlur}
      cliInput={terminalProp.cliInput}
      intelliSenseResults={terminalProp.intelliSenseResults}
      onIntelliSenseItemClick={terminalProp.terminalIntelliSenseItemClick}
      onTerminalAdditionalInputChange={terminalProp.terminalAdditionalInputChange}
      onTerminalAdditionalInputKeyDown={terminalProp.terminalAdditionalInputKeyDown}
      inputRef={terminalProp.terminalInputRef}
    />)
  }

  return (
    <div className="terminal-main">
      {terminalOutputs}
      {terminalInput}
      {spinnerControl}
      <div className="terminal-scroll-padding" />
    </div>
  );
};


