import React from "react";
import "./Terminal.css";
import TerminalInput from "./TerminalInput/TerminalInput";
import TerminalOutput from "./TerminalOutput/TerminalOutput";

const terminal = props => {
  let terminalOutputs = null;
  if (props.outputs != null && props.outputs.length > 0) {
    terminalOutputs = props.outputs.map(x => (
      <TerminalOutput data={x.data} elementType={x.type} />
    ));
  }

  return (
    <div className="terminal-main">
      {terminalOutputs}
      <TerminalInput
        onInputChange={props.terminalInputChange}
        onInputKeyUp={props.terminalInputKeyUp}
        terminalInputText={props.inputText}
      />
    </div>
  );
};

export default terminal;
