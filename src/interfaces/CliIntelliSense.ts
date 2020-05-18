


export interface CliIntelliSense {
    currentPos:ClientRect;
    results: Array<CLIVerb>
}

export interface CLIVerb {
    name: string;
    description?: string;
    usage?: string ;
    text?: string ;
    isSelected?:boolean;
}

export enum IntelliSenseType {

    None = 0,
    Action = 1,
    Target = 2,
    ActionParams = 3
}


export interface ClientRect{
    left:number;
    top:number;
}