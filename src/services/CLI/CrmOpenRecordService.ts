import IsEmpty from 'is-empty';
import { getEntityMetadataBasic } from '../CrmMetadataService';

import { retrieveMultiple } from '../../helpers/webAPIClientHelper';
import { EntityMetadata } from '../../interfaces/EntityMetadata';

export async function getCRMRecord(cliData: any) {


    let entityMetadata: EntityMetadata|null = await getEntityMetadataBasic(cliData.target);


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



    let entity: any = results[0];
    let id: any = entity[entityMetadata.PrimaryIdAttribute];
    let name: any = entity[entityMetadata.PrimaryNameAttribute];
    let resp: any = {
        entityReference: {
            id: id,
            logicalname: entityMetadata.LogicalName,
            entitySetName: entityMetadata.EntitySetName,
            name: name
        }
    };

    return resp;
}


function getEntityFilter(entityMetadata: any, cliData: any) {

    if (IsEmpty(cliData.actionParams) && IsEmpty(cliData.unnamedParam))
        return null;


    if (!IsEmpty(cliData.unnamedParam))
        return entityMetadata.PrimaryNameAttribute + " eq '" + cliData.unnamedParam + "'";


    let entityFilters: Array<any> = [];
    cliData.actionParams.forEach((param: any) => {
        if (!IsEmpty(param.name) && !IsEmpty(param.value)) {
            entityFilters.push(param.name + " eq '" + param.value + "'");
        }
    });

    let entityFilter = (entityFilters.length > 0) ? entityFilters.join(" and ") : null;
    return entityFilter;
}