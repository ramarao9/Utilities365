import React from "react";
import "./Table.css";

interface TableData{
    UniqueIdKey:string;
    HeaderColumns:Array<string>;
    RowData:Array<any>;
}

export const Table: React.FC<TableData> =(tableProps: TableData)=>{


    let tableHeaders=(
        <tr>
        {tableProps.HeaderColumns.map(tableProp=>(
          <th className="th-table" key={tableProp}>{tableProp}</th>
        ))}
        </tr>
            );


let tableBdy=(
tableProps.RowData.map((record:any,index:number)=>(        
<tr key={record[tableProps.UniqueIdKey]+"_"+index}>
{tableProps.HeaderColumns.map((tableProp:string)=>(
  <td className="tdWs" key={`${record[tableProps.UniqueIdKey]+tableProp}`}>{record[tableProp]?`${record[tableProp]}`:''}</td>
   ))}
</tr>
))
);


return (
<div className="table-container">
<table className="table cust-tbl">
<thead>
{tableHeaders}
</thead>
 <tbody>
 {tableBdy}
 </tbody>
</table>
</div>);
}