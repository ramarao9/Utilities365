import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense";
import { GROUP_NAME_OPEN_DEFAULT } from "../Target/Open";


export const ACTION_PARAM_OPEN_ENTITY = "entity";
export const ACTION_PARAM_OPEN_APP = "app";

export const ACTION_PARAM_OPEN_NAME = "name";
export const ACTION_PARAMS_OPEN_NAME: CLIVerb = { name: ACTION_PARAM_OPEN_NAME, type: IntelliSenseType.ActionParams };
export const CLI_ACTION_PARAMS_OPEN_GENERIC: Array<CLIVerb> = [ACTION_PARAMS_OPEN_NAME];




export const ACTION_PARAM_OPEN_MODE = "mode";
export const ACTION_PARAM_OPEN_RECORD_MODE_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_MODE,
      description:"Ignored when app is set",
      type: IntelliSenseType.ActionParams, group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};

export const ACTION_PARAM_OPEN_RECORD_APP_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_APP,
      type: IntelliSenseType.ActionParams, group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};
export const CLI_ACTION_PARAMS_OPEN_RECORD: Array<CLIVerb> = [ACTION_PARAM_OPEN_RECORD_APP_NAME,
      ACTION_PARAM_OPEN_RECORD_MODE_NAME];




export const ACTION_PARAM_OPEN_NEW_RECORD_FORM = "form";
export const ACTION_PARAM_OPEN_NEW_RECORD_ENTITY_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_ENTITY,
      type: IntelliSenseType.ActionParams, group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};
export const ACTION_PARAM_OPEN_NEW_RECORD_APP_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_APP,
      type: IntelliSenseType.ActionParams, group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};
export const ACTION_PARAM_OPEN_NEW_RECORD_FORM_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_NEW_RECORD_FORM,
      type: IntelliSenseType.ActionParams, group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};
export const CLI_ACTION_PARAMS_OPEN_NEW_RECORD: Array<CLIVerb> = [ACTION_PARAM_OPEN_NEW_RECORD_ENTITY_NAME,
      ACTION_PARAM_OPEN_NEW_RECORD_APP_NAME];






export const ACTION_PARAM_OPEN_VIEW_ENTITY_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_ENTITY,
      type: IntelliSenseType.ActionParams
};

export const ACTION_PARAM_OPEN_VIEW_APP_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_APP,
      description: "Choose the Model-driven app",
      type: IntelliSenseType.ActionParams
};

export const ACTION_PARAM_OPEN_VIEW_MODE_NAME: CLIVerb = {
      name: ACTION_PARAM_OPEN_MODE,
      type: IntelliSenseType.ActionParams
};

export const CLI_ACTION_PARAMS_OPEN_VIEW: Array<CLIVerb> = [ACTION_PARAM_OPEN_VIEW_ENTITY_NAME,
      ACTION_PARAM_OPEN_VIEW_APP_NAME,
      ACTION_PARAM_OPEN_VIEW_MODE_NAME];
