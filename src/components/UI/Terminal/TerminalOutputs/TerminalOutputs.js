import React from 'react';
import './TerminalOutputs.css';


const terminaloutputs = (props) => (





    return(
    <div>
        {props.outputs.map(output => (
            <pre className="terminal-output-line">{output}</pre>
        ))}

    </div>);
);

export default terminaloutputs;