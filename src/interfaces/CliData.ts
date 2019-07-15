export interface CliData {
  action: string;
  target: string;
  unnamedParam?: string;
  actionParams?: Array<ActionParam>;
}


export interface ActionParam {
  name: string;
  value?: any;
}


