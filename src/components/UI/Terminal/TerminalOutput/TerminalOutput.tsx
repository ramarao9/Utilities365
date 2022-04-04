import React from "react";
import JSONTree from 'react-json-tree'
import { TerminalOut } from "../../../../interfaces/TerminalOut";
import "./TerminalOutput.css";
import { getJSONTreeTheme } from "../../../../helpers/common";
import { Table } from "../../Table/Table";
import { CliResponse, CliResponseType } from "../../../../interfaces/CliResponse";

export const terminalOutput: React.FC<CliResponse> = (
  terminalOutputProps: CliResponse
) => {
  let output = null;





  switch (terminalOutputProps.type) {
    case CliResponseType.Table:
      let responseData = terminalOutputProps.response;
      let uniqueidAttribute = responseData.uniqueidattribute as string;
      let tableData = responseData.data as Array<any>;
      let tableProperties: Array<string> = [];

      if (tableData != null && tableData.length > 0) {
        let objWithKeys = tableData.reduce((res, item) => ({ ...res, ...item }));
        tableProperties = Object.keys(objWithKeys);
      }


      if (tableProperties.length === 0) {
        output = (
          <pre className="terminal-output-line">{terminalOutputProps.message}</pre>
        );
      }
      else {
        output = (
          <Table UniqueIdKey={uniqueidAttribute} HeaderColumns={tableProperties} RowData={tableData} />
        );
      }


      break;

    case CliResponseType.JSON:

      let treeTheme = getJSONTreeTheme();
      let jsonData = terminalOutputProps.response;
      output = (<JSONTree data={jsonData} theme={treeTheme} invertTheme={false} shouldExpandNode={(keyName, data, level) => level < 2} />);
      break;

    case CliResponseType.Error:
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
