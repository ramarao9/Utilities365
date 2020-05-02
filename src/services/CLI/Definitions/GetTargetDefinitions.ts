import { CLIVerb } from "../../../interfaces/CliIntelliSense"

export const TARGET_GET_ENTITY_NAME="entity";
export const TARGET_GET_ENTITIES_NAME="entities";
export const TARGET_GET_ATTRIBUTE_NAME="attribute";
export const TARGET_GET_ATTRIBUTES_NAME="attributes";


export const TARGET_GET_ENTITY: CLIVerb = { name: TARGET_GET_ENTITY_NAME, description: "" };
export const TARGET_GET_ENTITIES: CLIVerb = { name: TARGET_GET_ENTITIES_NAME, description: "" };
export const TARGET_GET_ATTRIBUTE: CLIVerb = { name: TARGET_GET_ATTRIBUTE_NAME, description: "" };
export const TARGET_GET_ATTRIBUTES: CLIVerb = { name: TARGET_GET_ATTRIBUTES_NAME, description: "" };

export const CLI_TARGET_GET: Array<CLIVerb> = [TARGET_GET_ENTITY,
    TARGET_GET_ENTITIES,
    TARGET_GET_ATTRIBUTE,
    TARGET_GET_ATTRIBUTES];