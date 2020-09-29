import { retrieveMultiple } from "../helpers/webAPIClientHelper"
import { ViewData, ViewType, EntityViewData } from "../interfaces/ViewData";

import store from "../store/store";
import * as actionTypes from "../store/actions";
import { getEntityMetadataBasic } from "./CrmMetadataService";



export const getFetchXml = async (viewName: string, entityName: string) => {
    let entityViewData = await getEntityViews(entityName);

    let views = entityViewData.views;
    let view = views.find(x => x.name.toLowerCase() === viewName.toLowerCase());
    return view?.fetchXml;
}

export const getEntityViews = async (entityName: string): Promise<EntityViewData> => {

    let entityMetadata = await getEntityMetadataBasic(entityName);
    let entityLogicalName = entityMetadata.LogicalName;

    let entityViewData: EntityViewData = { entityName: entityLogicalName, views: [] };
    let entitiesViewData: EntityViewData[] = getEntitiesViewsFromStore();
    if (entitiesViewData && entitiesViewData.length > 0) {
        let matchedRecord = entitiesViewData.find(x => x.entityName === entityLogicalName);
        if (matchedRecord) {
            entityViewData.views = matchedRecord.views;
            return entityViewData;
        }
    }

    let systemViews = await getSystemViews(entityLogicalName);
    let userViews = await getUserViews(entityLogicalName);

    let views = [...systemViews, ...userViews];
    views = views.filter(x => x.name.indexOf("--") == -1);

    //Remove views with duplicate names
    const flags = new Set();
    views = views.filter(view => {
        if (flags.has(view.name)) {
            return false;
        }
        flags.add(view.name);
        return true;
    });


    entityViewData.views = views;

    //Update the store with the entity views so it's avilable later
    entitiesViewData.push(entityViewData);
    updateEntitiesViewDataInStore(entitiesViewData);

    return entityViewData;
}


const getSystemViews = async (entityname: string): Promise<ViewData[]> => {

    let systemViews: ViewData[] = [];

    var retrieveMultipleRequest = {
        collection: "savedqueries",
        filter: `returnedtypecode eq '${entityname}'`,
        select: ["savedqueryid", "name", "fetchxml"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);
    let responseData : any= retrieveMultipleResp.value;
    (responseData).forEach((entity: any) => {


        let view: ViewData = {
            name: entity.name,
            fetchXml: entity.fetchxml,
            id: entity.id,
            type: ViewType.SystemView
        };
        systemViews.push(view);
    });


    return systemViews;
}



const getUserViews = async (entityname: string): Promise<ViewData[]> => {
    let userViews: ViewData[] = [];

    var retrieveMultipleRequest = {
        collection: "userqueries",
        filter: `returnedtypecode eq '${entityname}'`,
        select: ["userqueryid", "name", "fetchxml"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);
    let responseData : any = retrieveMultipleResp.value;
    (responseData).forEach((entity: any) => {

        let view: ViewData = { name: entity.name, fetchXml: entity.fetchxml, id: entity.id, type: ViewType.UserView };
        userViews.push(view);
    });

    return userViews;

}


function getEntitiesViewsFromStore() {
    const currentState = store.getState();
    return currentState != null && currentState.entitiesViewData ? currentState.entitiesViewData : [];
}


function updateEntitiesViewDataInStore(entitiesViewData: EntityViewData[]) {
    store.dispatch({ type: actionTypes.SET_ENTITIES_VIEW_DATA, entitiesViewData: entitiesViewData });
}