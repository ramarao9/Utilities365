import store from "../store/store";
import * as actionTypes from "../store/actions";
import { AppModule } from "../interfaces/Entities/AppModule";
import { retrieveMultiple } from "../helpers/webAPIClientHelper";


export const getAppModules = async () => {

    let appModules: AppModule[] = [];
    let appModulesFromStore: AppModule[] = getAppModulesFromStore();
    if (appModulesFromStore && appModulesFromStore.length > 0) {
        return appModulesFromStore;
    }

    var retrieveMultipleRequest = {
        collection: "appmodules",
        filter: `statecode eq 0`,
        select: ["appmoduleid", "name"]
    };

    let retrieveMultipleResp = await retrieveMultiple(retrieveMultipleRequest);
    let responseData: any = retrieveMultipleResp.value;
    (responseData).forEach((entity: any) => {
        let appModule: AppModule = { name: entity.name, id: entity.appmoduleid };
        appModules.push(appModule);
    });

    if (appModules.length > 0) {
        updateAppsInStore(appModules);
    }

    return appModules;
}



function getAppModulesFromStore() {
    const currentState = store.getState();
    return currentState != null && currentState.apps ? currentState.apps : [];
}


function updateAppsInStore(appModules: AppModule[]) {
    store.dispatch({ type: actionTypes.SET_APPS, apps: appModules });
}