import React from "react";
import "./TerminalInput.css";

interface TerminalInp {
  terminalInputText: string;
  onInputKeyDown(e: any): void;
  onInputChange(e: any): void;
}

export const TerminalInput: React.FC<TerminalInp> = (terminalInpProp: TerminalInp) => (

  <div className="terminal-input">
    <div>
      <span className="terminal-prompt">&gt;</span>
    </div>
    <div className="terminal-inp-cont">
      <input
        type="text"
        autoFocus
        onKeyDown={terminalInpProp.onInputKeyDown}
        onChange={terminalInpProp.onInputChange}
        value={terminalInpProp.terminalInputText}
        className="terminal-main-input"
        tabIndex={-1}
      />
    </div>
  </div>
);
