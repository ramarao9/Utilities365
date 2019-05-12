import IsEmpty from 'is-empty';
import { getEntityMetadata } from '../CrmMetadataService';

import { retrieveMultiple } from '../../helpers/webAPIClientHelper';

export async function getCRMRecord(cliData) {


    let entityMetadata = await getEntityMetadata(cliData.target);


    if (entityMetadata == null)
        return { message: "No entity found in crm that matches the Name. Please check the name and try again" };



    let entityFilter = getEntityFilter(entityMetadata, cliData);
    if (IsEmpty(entityFilter))
        return { message: "Please provide parameters for the record to filter the entity." }

    let retrieveMultipleRequest = {
        collection: entityMetadata.LogicalCollectionName,
        select: [entityMetadata.PrimaryIdAttribute, entityMetadata.PrimaryNameAttribute],
        filter: entityFilter
    };


    let retrieveMultipleResponse = await retrieveMultiple(retrieveMultipleRequest);

    let results = await retrieveMultipleResponse.value;

    if (results == null || results.length === 0)
        return { message: "No match found" };



    if (results.length > 1)
        return { message: "Multiple records found. Please refine the criteria and try again" };



    let entity = results[0];

    return { entityReference: { id: entity[entityMetadata.PrimaryIdAttribute], logicalname: entityMetadata.LogicalName, name : entity[entityMetadata.PrimaryNameAttribute]} };

}


function getEntityFilter(entityMetadata, cliData) {

    if (IsEmpty(cliData.actionParams) && IsEmpty(cliData.unnamedParam))
        return null;


    if (!IsEmpty(cliData.unnamedParam))
        return entityMetadata.PrimaryNameAttribute + " eq '" + cliData.unnamedParam + "'";


    let entityFilters = [];
    cliData.actionParams.forEach(param => {
        if (!IsEmpty(param.name) && !IsEmpty(param.value)) {
            entityFilters.push(param.name + " eq '" + param.value + "'");
        }
    });

    let entityFilter = (entityFilters.length > 0) ? entityFilters.join(" and ") : null;
    return entityFilter;
}