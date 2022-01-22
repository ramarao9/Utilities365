import React, {  useCallback } from "react";
import "./TerminalInput.css";
import { CliIntelliSense, CLIVerb } from "../../../../interfaces/CliIntelliSense"
import { Group } from "../../../../interfaces/Group";
import { getGroups } from "../../../../helpers/cliutil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface TerminalInp {
  terminalInputText: string;
  intelliSenseResults: CliIntelliSense;
  onInputKeyDown(e: any): void;
  onInputChange(e: any): void;
  onInputKeyPress?(e: any): void;
  onInputBlur?(e: any): void;
  onIntelliSenseItemClick(e: any, resultItem: CLIVerb): void;
  inputRef: any;
}

export const TerminalInput: React.FC<TerminalInp> = (terminalInpProp: TerminalInp) => {


  const setScrollPosition= useCallback((el:any,isSelected:boolean| undefined) => {
    if (el !== null && isSelected) {
      el.scrollIntoView();
    }
  }, []);



  let intellisenseStyle = {
    left: terminalInpProp.intelliSenseResults.currentPos.left
  }


  let intelliSenseContent = null;
  if (terminalInpProp.intelliSenseResults && terminalInpProp.intelliSenseResults.results) {
    let results = terminalInpProp.intelliSenseResults.results;

    const groups: Array<Group> = getGroups(results);

    if (groups.length > 0) {

      intelliSenseContent = (
        <div className="intellisense-results" style={intellisenseStyle}>
          {groups.map((group: Group, index: number) => {

            let groupName = group.Name;
            let hideGroup = (groups.length === 0 || (groups.length === 1 && groupName === "Default"));
            let groupResults = results.filter(x => x.group === groupName);

            return (
              <div className="is-group" key={`${groupName}_${index}`}>
                {!hideGroup ? <div className="is-group-name">
                  <span>{groupName}</span>
                </div> : null}
                <ul className="is-list-none">
                  {groupResults.map((resultItem: CLIVerb, index: number) => {
                    return (<li ref={el=>setScrollPosition(el,resultItem.isSelected)}  key={resultItem.text ? `${groupName}_${resultItem.text}_${resultItem.name}` : `${groupName}_${resultItem.name}`} onMouseDown={event => terminalInpProp.onIntelliSenseItemClick(event, resultItem)} className={resultItem.isSelected ? 'selected' : ''}>
                      {resultItem.name}
                      {(resultItem.description !== "") ? (<span className="intsense-sub-title">{resultItem.description}</span>) : <span></span>}
                    </li>)
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      );
    }
  }

  return (<div className="terminal-input">
    <div>
      <span className="terminal-prompt">
        <FontAwesomeIcon icon="greater-than" color="lightgreen" style={{ height:'14px'}}   size="1x"/></span>
    </div>
    <div className="terminal-inp-cont">
      <div>
        <input
          type="text"
          onKeyDown={event => terminalInpProp.onInputKeyDown(event)}
          onChange={event => terminalInpProp.onInputChange(event)}
          onBlur={event => terminalInpProp.onInputBlur ? terminalInpProp.onInputBlur(event) : null}
          value={terminalInpProp.terminalInputText}
          className="terminal-main-input"
          ref={terminalInpProp.inputRef}
        />
      </div>
      {intelliSenseContent}
    </div>
  </div>);
};
