import React from "react";
import "./TerminalInput.css";
import {CliIntelliSense,CLIVerb} from "../../../../interfaces/CliIntelliSense"
interface TerminalInp {
  terminalInputText: string;
  intelliSenseResults:CliIntelliSense;
  onInputKeyDown(e: any): void;
  onInputChange(e: any): void;
  onInputKeyPress(e: any): void;
  onInputBlur?(e:any):void;
  onIntelliSenseItemClick(e:any,resultItem :CLIVerb):void;
  inputRef:any;
}

export const TerminalInput: React.FC<TerminalInp> = (terminalInpProp: TerminalInp) => {



let intelliSenseContent = null;
if (terminalInpProp.intelliSenseResults && terminalInpProp.intelliSenseResults.results) {
 let results= terminalInpProp.intelliSenseResults.results;
  intelliSenseContent = (<div className= "intellisense-results">
    <ul className="is-list-none">
      {results.map((resultItem :CLIVerb) => (
        <li key={resultItem.name} onMouseDown={event=> terminalInpProp.onIntelliSenseItemClick(event, resultItem)} className={resultItem.isSelected? 'selected' :''}>
        {resultItem.name}
       {(resultItem.description!=="")?(<span className="intsense-sub-title">{resultItem.description}</span>):<span></span>} 
        </li>
      ))}
      </ul>
      </div>);
}


 return(<div className="terminal-input">
    <div>
      <span className="terminal-prompt">&gt;</span>
    </div>
    <div className="terminal-inp-cont">
      <input
        type="text"
        autoFocus
        onKeyDown={terminalInpProp.onInputKeyDown}
        onKeyPress={terminalInpProp.onInputKeyPress}
        onChange={terminalInpProp.onInputChange}
        onBlur={terminalInpProp.onInputBlur}
        value={terminalInpProp.terminalInputText}
        className="terminal-main-input"
        tabIndex={-1}
        ref={terminalInpProp.inputRef}
      />

{intelliSenseContent}
    </div>
  </div>);
};
