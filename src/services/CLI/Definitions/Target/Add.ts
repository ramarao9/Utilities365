import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_ADD_ROLE_NAME="role";
export const TARGET_ADD_ROLE: CLIVerb = { name: TARGET_ADD_ROLE_NAME, description: "", type:IntelliSenseType.Target};
export const CLI_TARGET_ADD: Array<CLIVerb> = [TARGET_ADD_ROLE];