import { CLIVerb, IntelliSenseType } from "../../../../interfaces/CliIntelliSense"

export const TARGET_EXECUTE_FETCH_XML_NAME = "fetchxml";


export const TARGET_EXECUTE_FETCH_XML: CLIVerb = { name: TARGET_EXECUTE_FETCH_XML_NAME, description: "", type: IntelliSenseType.Target };


export const CLI_TARGET_EXECUTE: Array<CLIVerb> = [TARGET_EXECUTE_FETCH_XML]

