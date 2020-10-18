import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_GET_ENTITY_NAME="entity";
export const TARGET_GET_ENTITIES_NAME="entities";
export const TARGET_GET_ATTRIBUTE_NAME="attribute";
export const TARGET_GET_ATTRIBUTES_NAME="attributes";
export const TARGET_GET_ORG_DETAIL_NAME="org-detail";
export const GROUP_NAME_GET_METADATA="Metadata";

export const GROUP_NAME_GET_ENTITIES = "Entities";

export const TARGET_GET_ENTITY: CLIVerb = { name: TARGET_GET_ENTITY_NAME, description: "", type:IntelliSenseType.Target,  group: GROUP_NAME_GET_METADATA, groupNumber: 1 ,};
export const TARGET_GET_ENTITIES: CLIVerb = { name: TARGET_GET_ENTITIES_NAME, description: "",type:IntelliSenseType.Target,   group: GROUP_NAME_GET_METADATA, groupNumber: 1};
export const TARGET_GET_ATTRIBUTE: CLIVerb = { name: TARGET_GET_ATTRIBUTE_NAME, description: "",type:IntelliSenseType.Target ,   group: GROUP_NAME_GET_METADATA, groupNumber: 1};
export const TARGET_GET_ATTRIBUTES: CLIVerb = { name: TARGET_GET_ATTRIBUTES_NAME, description: "",type:IntelliSenseType.Target ,  group: GROUP_NAME_GET_METADATA, groupNumber: 1};
export const TARGET_GET_ORG_DETAIL: CLIVerb = { name: TARGET_GET_ORG_DETAIL_NAME, description: "",type:IntelliSenseType.Target,  group: GROUP_NAME_GET_METADATA, groupNumber: 1 };

export const CLI_TARGET_GET: Array<CLIVerb> = [TARGET_GET_ENTITY,
    TARGET_GET_ENTITIES,
    TARGET_GET_ATTRIBUTE,
    TARGET_GET_ATTRIBUTES,
    TARGET_GET_ORG_DETAIL];