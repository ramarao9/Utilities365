

let defaultActionParamNameValueMappings = {};
defaultActionParamNameValueMappings["open-solution"] = "Name";
defaultActionParamNameValueMappings["open-advfind"] = "EntityLogicalName";


export function getDefaultParamName(action) {
    if (action == null || action === '')
        return null;

    return defaultActionParamNameValueMappings[action];
}