import React, { KeyboardEventHandler, useCallback } from "react";
import "./TerminalInput.css";
import { CliIntelliSense, CLIVerb } from "../../../../interfaces/CliIntelliSense"
import { Group } from "../../../../interfaces/Group";
import { getGroups } from "../../../../helpers/cliutil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CliInput } from "../../../../interfaces/CliInput";
interface TerminalInp {
  cliInput: CliInput;
  intelliSenseResults: CliIntelliSense;
  onInputKeyDown(e: any): void;
  onInputChange(e: any): void;
  onInputKeyPress?(e: any): void;
  onInputBlur?(e: any): void;
  onIntelliSenseItemClick(e: any, resultItem: CLIVerb): void;
  onTerminalAdditionalInputChange(e: React.ChangeEvent<HTMLTextAreaElement>): void;
  onTerminalAdditionalInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement> | undefined): void;
  inputRef: any;
}

export const TerminalInput: React.FC<TerminalInp> = (terminalInpProp: TerminalInp) => {



  const MIN_TEXTAREA_HEIGHT = 32;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);


  React.useLayoutEffect(() => {
    if (textareaRef != null && textareaRef.current != null) {
      // Reset height - important to shrink on delete
      textareaRef.current.style.height = "inherit";
      // Set height
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        MIN_TEXTAREA_HEIGHT
      )}px`;
    }
  }, [terminalInpProp.cliInput.text]);



  const setScrollPosition = useCallback((el: any, isSelected: boolean | undefined) => {
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
                    return (<li ref={el => setScrollPosition(el, resultItem.isSelected)} key={resultItem.text ? `${groupName}_${resultItem.text}_${resultItem.name}` : `${groupName}_${resultItem.name}`} onMouseDown={event => terminalInpProp.onIntelliSenseItemClick(event, resultItem)} className={resultItem.isSelected ? 'selected' : ''}>
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

  let inputCont = (<>  <div>
    <span className="terminal-prompt">
      <FontAwesomeIcon icon="greater-than" color="lightgreen" style={{ height: '14px' }} size="1x" /></span>
  </div>
    <div className="terminal-inp-cont">
      <div>
        <input
          type="text"
          onKeyDown={event => terminalInpProp.onInputKeyDown(event)}
          onChange={event => terminalInpProp.onInputChange(event)}
          onBlur={event => terminalInpProp.onInputBlur ? terminalInpProp.onInputBlur(event) : null}
          value={terminalInpProp.cliInput.text}
          className="terminal-main-input"
          ref={terminalInpProp.inputRef} />
      </div>
      {intelliSenseContent}
    </div>
  </>
  )

  if (terminalInpProp.cliInput.isPartOfMultiInputRequest) {
    inputCont = (
      <div className="terminal-inp-cont">
        <div>
          <textarea
            rows={terminalInpProp.cliInput.isMultiline ? 6 : 1}
            ref={textareaRef}
            style={{
              minHeight: MIN_TEXTAREA_HEIGHT,
              resize: "none"
            }}
            onKeyDown={event => { terminalInpProp.onTerminalAdditionalInputKeyDown(event) }}
            onChange={event => { terminalInpProp.onTerminalAdditionalInputChange(event) }}
            value={terminalInpProp.cliInput.text}
            className="terminal-main-input terminal-main-input-textarea"
            placeholder={terminalInpProp.cliInput.placeholder}
          />
        </div>
      </div>)
  }

  return (<div className="terminal-input">
    {inputCont}
  </div>);
};
