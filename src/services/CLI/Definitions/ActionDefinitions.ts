import { CLIVerb, IntelliSenseType } from "../../../interfaces/CliIntelliSense"


export const ACTION_ADD_NAME="add";
export const ACTION_CREATE_NAME="create";
export const ACTION_EXECUTE_NAME="execute";
export const ACTION_GET_NAME="get";
export const ACTION_OPEN_NAME="open";
export const ACTION_REMOVE_NAME="remove";
export const ACTION_UPDATE_NAME="update";


export const ACTION_ADD: CLIVerb = { name: ACTION_ADD_NAME, description: "Add data, relationships etc.",type:IntelliSenseType.Action };
export const ACTION_CREATE: CLIVerb = { name: ACTION_CREATE_NAME, description: "Create records in Dynamics365.",type:IntelliSenseType.Action };
export const ACTION_EXECUTE: CLIVerb = { name: ACTION_EXECUTE_NAME, description: "Used to perform an bound or unbound operation." ,type:IntelliSenseType.Action};
export const ACTION_GET: CLIVerb = { name: ACTION_GET_NAME, description: "Retrieves data including metadata.",type:IntelliSenseType.Action };
export const ACTION_OPEN: CLIVerb = { name: ACTION_OPEN_NAME, description: "Helps with navigating Dynamics365.",type:IntelliSenseType.Action };
export const ACTION_REMOVE: CLIVerb = { name: ACTION_REMOVE_NAME, description: "Deletes or removes relationships.",type:IntelliSenseType.Action };
export const ACTION_UPDATE: CLIVerb = { name: ACTION_UPDATE_NAME, description: "Update records in Dynamics365.",type:IntelliSenseType.Action };

export const CLI_ACTIONS: Array<CLIVerb> = [ACTION_ADD,
                                            ACTION_CREATE,
                                            ACTION_EXECUTE,
                                            ACTION_GET,
                                            ACTION_OPEN,
                                            ACTION_REMOVE,
                                            ACTION_UPDATE];
