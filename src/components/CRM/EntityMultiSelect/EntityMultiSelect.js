import React from 'react'
import  DropDown  from '../../UI/DropDown/DropDown'

const entityMultiSelect = (props) => (
    <DropDown placeholder='Select Entity(s)' 
    label={props.label} 
    fluid multiple search selection 
    changed={props.changed}
    options={props.entities.map(entityObj =>{return {Label:entityObj.DisplayName,Value:entityObj.LogicalName, AlternateValue:entityObj.OTC}}) } />
);


export default entityMultiSelect;