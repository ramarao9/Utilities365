import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_OPEN_ENTITY_NAME="entity";
export const TARGET_OPEN_ADVANCED_FIND_NAME="advancedfind";


export const TARGET_OPEN_ENTITY: CLIVerb = { name: TARGET_OPEN_ENTITY_NAME, description: "", type:IntelliSenseType.Target, order:20};
export const TARGET_OPEN_ADVANCED_FIND: CLIVerb = { name: TARGET_OPEN_ADVANCED_FIND_NAME, description: "",type:IntelliSenseType.Target, order:10 };


export const CLI_TARGET_OPEN: Array<CLIVerb> = [TARGET_OPEN_ENTITY,
    TARGET_OPEN_ADVANCED_FIND];