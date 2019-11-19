import React from "react";
import "./Terminal.css";
import { TerminalInput } from "./TerminalInput/TerminalInput";
import { TerminalOut } from "../../../interfaces/TerminalOut";
import { terminalOutput as TerminalOutput } from "./TerminalOutput/TerminalOutput";
import { Spinner } from "../../../interfaces/Spinner";
import {SpinIcon} from "../SpinIcon/SpinIcon";
interface TerminalProp {
  outputs: Array<TerminalOut>;
  terminalInputChange: any;
  terminalInputKeyDown: any;
  inputText: string;
  spinner: Spinner
}

export const Terminal: React.FC<TerminalProp> = (terminalProp: TerminalProp) => {
  let terminalOutputs = null;
  if (terminalProp.outputs != null && terminalProp.outputs.length > 0) {
    terminalOutputs = terminalProp.outputs.map((x,index) => (
      <TerminalOutput key={index} message={x.message} type={x.type} data={x.data} />
    ));
  }

let spinnerControl=null;
if(terminalProp.spinner && terminalProp.spinner.show)
{
  spinnerControl=(<SpinIcon show={terminalProp.spinner.show}/>);
}

  return (
    <div className="terminal-main">
      {terminalOutputs}
      <TerminalInput
        onInputChange={terminalProp.terminalInputChange}
        onInputKeyDown={terminalProp.terminalInputKeyDown}
        terminalInputText={terminalProp.inputText}
      />
      {spinnerControl}
    </div>
  );
};


