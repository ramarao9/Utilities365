import React from 'react';
import './Terminal.css';
import TerminalInput from './TerminalInput/TerminalInput';
import TerminalOutputs from './TerminalOutputs/TerminalOutputs';


const terminal = (props) => (

    <div className="terminal-main">
        <TerminalOutputs outputs={props.outputs} />
        <TerminalInput onInputChange={props.terminalInputChange} 
        onInputKeyUp={props.terminalInputKeyUp}
        terminalInputText={props.inputText} />
    </div>
);

export default terminal;