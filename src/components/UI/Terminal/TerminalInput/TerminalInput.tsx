import React,{useRef, useEffect} from "react";
import "./TerminalInput.css";
import {CliIntelliSense,CLIVerb} from "../../../../interfaces/CliIntelliSense"
interface TerminalInp {
  terminalInputText: string;
  intelliSenseResults:CliIntelliSense;
  onInputKeyDown(e: any): void;
  onInputChange(e: any): void;
  onInputKeyPress?(e: any): void;
  onInputBlur?(e:any):void;
  onIntelliSenseItemClick(e:any,resultItem :CLIVerb):void;
  inputRef:any;
}

export const TerminalInput: React.FC<TerminalInp> = (terminalInpProp: TerminalInp) => {


  const refs = useRef(new Array(terminalInpProp.intelliSenseResults.results.length));

  useEffect(() => {
    let results = terminalInpProp.intelliSenseResults.results;

    if (results) {
      let selectedItemIndex = results.findIndex(x => x.isSelected);
      if (selectedItemIndex != -1) {
        let selectedItem: any = refs.current[selectedItemIndex];
        if (selectedItem) {
          selectedItem.scrollIntoView();
        }
      }
    }

  });

  let intellisenseStyle = {
    left: terminalInpProp.intelliSenseResults.currentPos.left
  }


let intelliSenseContent = null;
if (terminalInpProp.intelliSenseResults && terminalInpProp.intelliSenseResults.results) {
 let results= terminalInpProp.intelliSenseResults.results;
 if(results.length>0){
  intelliSenseContent = (<div className= "intellisense-results" style={intellisenseStyle}>
    <ul className="is-list-none">
      {results.map((resultItem :CLIVerb,index:number) => (
        <li  ref={el=>refs.current[index]=el} key={resultItem.text?`${resultItem.text}_${resultItem.name}`:resultItem.name} onMouseDown={event=> terminalInpProp.onIntelliSenseItemClick(event, resultItem)} className={resultItem.isSelected? 'selected' :''}>
        {resultItem.name}
       {(resultItem.description!=="")?(<span className="intsense-sub-title">{resultItem.description}</span>):<span></span>} 
        </li>
      ))}
      </ul>
      </div>);
 }
}


 return(<div className="terminal-input">
    <div>
      <span className="terminal-prompt">&gt;</span>
    </div>
    <div className="terminal-inp-cont">
      <input
        type="text"
        onKeyDown={event=>terminalInpProp.onInputKeyDown(event)}   
        onChange={event=>terminalInpProp.onInputChange(event)}
        onBlur={event=>terminalInpProp.onInputBlur?terminalInpProp.onInputBlur(event):null}
        value={terminalInpProp.terminalInputText}
        className="terminal-main-input"

        ref={terminalInpProp.inputRef}
      />
<div className="dummy-div"/>
{intelliSenseContent}
    </div>
  </div>);
};
