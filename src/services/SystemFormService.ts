import { retrieveMultiple } from "../helpers/webAPIClientHelper";
import { SystemForm } from "../interfaces/Entities/SystemForm";
import store from "../store/store";
import * as actionTypes from "../store/actions";



export const getEntityForms = async (entityName: string) => {

    let systemForms: SystemForm[] = await getSystemEntityForms();

    let entityForms = systemForms.filter(x => x.objectTypeCode === entityName);
    return entityForms;
}



export const getSystemEntityForms = async () => {

    let systemForms: SystemForm[] = [];
    let systemFormsFromStore: SystemForm[] = getSystemFormsFromStore();
    if (systemFormsFromStore && systemFormsFromStore.length > 0) {
        return systemFormsFromStore;
    }

    var retrieveMultipleRequest = {
        collection: "systemforms",
        filter: "type eq 2",//FormType=Main
        select: ["formid", "objecttypecode", "name"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);


    let responseData: any = retrieveMultipleResp.value;
    if (responseData.length === 0) {
        throw new Error(`No forms exist.`);
    }

    systemForms = (responseData).map((entity: any) => {
        let systemForm: SystemForm = { name: entity.name, formId: entity.formid, objectTypeCode: entity.objecttypecode };
        return systemForm;
    });

    if (systemForms.length > 0) {
        updateSystemFormsInStore(systemForms);
    }



    return systemForms;


}



function getSystemFormsFromStore() {
    const currentState = store.getState();
    return currentState != null && currentState.systemForms ? currentState.systemForms : [];
}


function updateSystemFormsInStore(systemForms: SystemForm[]) {
    store.dispatch({ type: actionTypes.SET_SYSTEM_FORMS, systemForms: systemForms });
}