import React from 'react';
import './TerminalOutputs.css';


const terminaloutputs = (props) => (
    <div>
        {props.outputs.map(output => (
            <pre className="terminal-output-line">{output}</pre>
        ))}

    </div>
);

export default terminaloutputs;