import React from 'react'
import './TerminalInput.css';


const terminalInput = (props) => (

    <div className="terminal-input">
        <div><span className="terminal-prompt">&gt;</span></div>
        <div className="terminal-inp-cont">
            <input type="text" autoFocus  onKeyUp={props.onInputKeyUp}
            onChange={props.onInputChange} value={props.terminalInputText}
            className="terminal-main-input" tabIndex="-1" />
        </div>
    </div>

);

export default terminalInput;