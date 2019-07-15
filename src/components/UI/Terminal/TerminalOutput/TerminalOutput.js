import React from "react";
import "./TerminalOutput.css";

const terminalOutput = props => {
  let output = null;

  switch (props.elementType) {
    case "table":
      break;

    case "error":
      output = <pre className="terminal-output-line error">{props.data}</pre>;
      break;

    default:
      output = <pre className="terminal-output-line">{props.data}</pre>;
      break;
  }

  return <div>{output}</div>;
};

export default terminalOutput;
