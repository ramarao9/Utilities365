import React from "react";



interface TableData{
    UniqueIdKey:string;
    HeaderColumns:Array<string>;
    RowData:Array<any>;
}

export const Table: React.FC<TableData> =(tableProps: TableData)=>{


    let tableHeaders=(
        <tr>
        {tableProps.HeaderColumns.map(tableProp=>(
          <th key={tableProp}>{tableProp}</th>
        ))}
        </tr>
            );


let tableBdy=(
tableProps.RowData.map((record:any)=>(        
<tr key={record[tableProps.UniqueIdKey]}>
{tableProps.HeaderColumns.map((tableProp:string)=>(
  <td key={`${record[tableProps.UniqueIdKey]+tableProp}`}>{`${record[tableProp]}`}</td>
   ))}
</tr>
))
);


return (
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