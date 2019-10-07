export interface CliData {
  action: string;
  target: string;
  unnamedParam?: string;
  actionParams?: Array<ActionParam>;
  outputVariable: string | null;
  cliOutput: CliOutput;
}


export interface ActionParam {
  name: string;
  value?: any | null;
}

export interface CliOutput {
  format: string;
  render: boolean;
}