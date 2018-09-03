

let defaultActionParams = {};
defaultActionParams["open-solution"] = "Name";
defaultActionParams["open-advfind"] = "EntityLogicalName";


export function getDefaultParamName(action) {
    if (action == null || action === '')
        return null;

    return defaultActionParams[action];
}