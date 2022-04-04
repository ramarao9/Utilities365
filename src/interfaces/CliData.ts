import { CliInput } from "./CliInput";

export interface CliData {
  rawInput: string;
  action: string;
  target: string;
  unnamedParam?: string;
  actionParams?: Array<ActionParam>;
  outputVariable: string | null;
  cliOutput: CliOutput;
  steps?: Array<CliInput>;//Used when the Cli target requires multi input

}


export interface ActionParam {
  name: string;
  value?: any | null;
}

export interface CliOutput {
  format: string;
  render: boolean;
}