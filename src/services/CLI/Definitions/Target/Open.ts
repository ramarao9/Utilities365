import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_OPEN_ENTITY_NAME = "entity";
export const TARGET_OPEN_ADVANCED_FIND_NAME = "advancedfind";
export const TARGET_OPEN_NEW_RECORD_NAME = "new-record";
export const TARGET_OPEN_VIEW_NAME = "view";

export const GROUP_NAME_OPEN_DEFAULT = "Default";
export const GROUP_NAME_OPEN_ENTITIES = "Entities";

export const TARGET_OPEN_ENTITY: CLIVerb = {
    name: TARGET_OPEN_ENTITY_NAME, description: "",
    type: IntelliSenseType.Target, order: 20,
    group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};
export const TARGET_OPEN_ADVANCED_FIND: CLIVerb = {
    name: TARGET_OPEN_ADVANCED_FIND_NAME, description: "",
    type: IntelliSenseType.Target, order: 10,
    group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};

export const TARGET_OPEN_NEW_RECORD: CLIVerb = {
    name: TARGET_OPEN_NEW_RECORD_NAME, description: "",
    type: IntelliSenseType.Target, order: 30,
    group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};


export const TARGET_OPEN_VIEW: CLIVerb = {
    name: TARGET_OPEN_VIEW_NAME, 
    type: IntelliSenseType.Target, order: 40,
    group: GROUP_NAME_OPEN_DEFAULT, groupNumber: 1
};



export const CLI_TARGET_OPEN: Array<CLIVerb> = [TARGET_OPEN_ENTITY,
    TARGET_OPEN_ADVANCED_FIND,
    TARGET_OPEN_NEW_RECORD,
    TARGET_OPEN_VIEW];