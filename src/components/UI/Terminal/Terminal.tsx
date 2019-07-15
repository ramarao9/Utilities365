import * as React from "react";
import "./Terminal.css";
import TerminalInput from "./TerminalInput/TerminalInput";
import TerminalOutputs from "./TerminalOutputs/TerminalOutputs";

interface TerminalProps {
  outputs: any;
  terminalInputChange: any;
  terminalInputKeyUp: any;
  inputText: string;
}

export const Terminal: React.FC<TerminalProps> = (props) => {
  return (
    <div className="terminal-main">
      <TerminalOutputs outputs={props.outputs} />
      <TerminalInput
        onInputChange={props.terminalInputChange}
        onInputKeyUp={props.terminalInputKeyUp}
        terminalInputText={props.inputText}
      />
    </div>
  );
};


