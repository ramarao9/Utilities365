import React from "react";
import JSONTree from 'react-json-tree'
import { TerminalOut } from "../../../../interfaces/TerminalOut";
import "./TerminalOutput.css";
import { object } from "prop-types";
import {getJSONTreeTheme} from "../../../../helpers/common";
import {Table} from "../../Table/Table";

export const terminalOutput: React.FC<TerminalOut> = (
  terminalOutputProps: TerminalOut
) => {
  let output = null;

  

  switch (terminalOutputProps.type) {
    case "table":
    let responseData=terminalOutputProps.data;
    let uniqueidAttribute=responseData.uniqueidattribute as string;
    let tableData=responseData.data as Array<any>;
    let tableProperties : Array<string>=(tableData!=null &&tableData.length>0)?Object.keys(tableData[0]):[];

    if(tableProperties.length==0)
    {
    output = (
      <pre className="terminal-output-line">{terminalOutputProps.message}</pre>
    );
    }
    else{
      output=(
        <Table UniqueIdKey={uniqueidAttribute} HeaderColumns={tableProperties} RowData={tableData} />
      );
    }


      break;

     case "json":

        let treeTheme=getJSONTreeTheme();
        let jsonData=terminalOutputProps.data;
        output = (<JSONTree data={jsonData} theme={treeTheme} invertTheme={false} shouldExpandNode={(keyName, data, level)=>level<2} />);
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
