import { retrieveEntitites } from '../helpers/webAPIClientHelper'

import store from '../store/store'


export const getEntityMetadata = async (entityName) => {

    let entities = getEntitiesFromStore();

    if (entities == null) {
        let filter = "IsIntersect eq false";
        let entityProperties = getEntityProperties();
        entities = await retrieveEntitites(entityProperties, filter);

        // To Do:- Check Entities
    }




}



function retrieveEntititesFromCRMSuccess() {

}

function retrieveEntititesFromCRMError(error) {
    console.error(error.message);
}

function getEntitiesFromStore() {


    const currentState = store.getState();

    return (currentState != null) ? currentState.entities : null;
}

function getEntityProperties() {
    let entityProperties = ["DisplayName",
        "LogicalName",
        "DisplayCollectionName",
        "LogicalCollectionName",
        "ObjectTypeCode",
        "PrimaryNameAttribute",
        "SchemaName",
        "PrimaryIdAttribute"];

    return entityProperties;

}