import React from "react";
import "./Terminal.css";
import { TerminalInput } from "./TerminalInput/TerminalInput";
import { TerminalOut } from "../../../interfaces/TerminalOut";
import { terminalOutput as TerminalOutput } from "./TerminalOutput/TerminalOutput";

interface TerminalProp {
  outputs: Array<TerminalOut>;
  terminalInputChange: any;
  terminalInputKeyUp: any;
  inputText: string;
}

export const Terminal: React.FC<TerminalProp> = (terminalProp: TerminalProp) => {
  let terminalOutputs = null;
  if (terminalProp.outputs != null && terminalProp.outputs.length > 0) {
    terminalOutputs = terminalProp.outputs.map((x,index) => (
      <TerminalOutput key={index} message={x.message} type={x.type} data={x.data} />
    ));
  }

  return (
    <div className="terminal-main">
      {terminalOutputs}
      <TerminalInput
        onInputChange={terminalProp.terminalInputChange}
        onInputKeyUp={terminalProp.terminalInputKeyUp}
        terminalInputText={terminalProp.inputText}
      />
    </div>
  );
};

