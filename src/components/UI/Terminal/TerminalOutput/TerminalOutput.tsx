import React from "react";
import { TerminalOut } from "../../../../interfaces/TerminalOut";
import "./TerminalOutput.css";

export const terminalOutput: React.FC<TerminalOut> = (
  terminalOutputProps: TerminalOut
) => {
  let output = null;

  

  switch (terminalOutputProps.type) {
    case "table":
      break;

    case "error":
      output = (
        <pre className="terminal-output-line error">
          {terminalOutputProps.message}
        </pre>
      );
      break;

    default:
      output = (
        <pre className="terminal-output-line">{terminalOutputProps.message}</pre>
      );
      break;
  }

  return <div>{output}</div>;
};
