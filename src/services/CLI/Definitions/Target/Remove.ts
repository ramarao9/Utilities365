import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_REMOVE_ROLE_NAME="role";
export const TARGET_REMOVE_ROLE: CLIVerb = { name: TARGET_REMOVE_ROLE_NAME, description: "", type:IntelliSenseType.Target};
export const CLI_TARGET_REMOVE: Array<CLIVerb> = [TARGET_REMOVE_ROLE];