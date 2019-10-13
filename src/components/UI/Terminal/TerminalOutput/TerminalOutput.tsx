import React from "react";
import { TerminalOut } from "../../../../interfaces/TerminalOut";
import "./TerminalOutput.css";
import { object } from "prop-types";

export const terminalOutput: React.FC<TerminalOut> = (
  terminalOutputProps: TerminalOut
) => {
  let output = null;

  

  switch (terminalOutputProps.type) {
    case "table":
    let responseData=terminalOutputProps.data;
    let primaryIdAttribute=responseData.primaryidattribute as string;
    let tableData=responseData.data as Array<any>;
    let tableProperties : Array<string>=(tableData!=null &&tableData.length>0)?Object.keys(tableData[0]):[];

    if(tableProperties.length==0)
    {
    output = (
      <pre className="terminal-output-line">{terminalOutputProps.message}</pre>
    );
    }
    else{
      let tableHeaders=(
                  <tr>
                  {tableProperties.map(tableProp=>(
                    <th key={tableProp}>{tableProp}</th>
                  ))}
                  </tr>
      );


      let tableBdy=(
        tableData.map((record:any)=>(        
          <tr key={record[primaryIdAttribute]}>
          {tableProperties.map((tableProp:string)=>(
            <td key={`${record[primaryIdAttribute]+tableProp}`}>{`${record[tableProp]}`}</td>
             ))}
          </tr>
      ))
      );
    

      output=(
        <div className="table-container">
        <table className="table">
        <thead>
          {tableHeaders}
          </thead>
           <tbody>
           {tableBdy}
           </tbody>
        </table>
      </div>);
      }


      break;

     case "json":
         let jsonString=JSON.stringify(terminalOutputProps.data,null,2);
         output = (
           <pre className="terminal-output-line">{jsonString}</pre>
           );
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
