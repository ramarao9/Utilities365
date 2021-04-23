
export const MINIMUM_CHARS_FOR_INTELLISENSE: number = 1;

export interface CliIntelliSense {
    currentPos:ClientRect;
    results: Array<CLIVerb>;
    currentIndex?:number;
}



export interface IntelliSenseInput {   
    inputText: string;
    inputCaretPosition:number;
}

export interface CLIVerb {
    name: string;
    description?: string;
    usage?: string ;
    text?: string ;
    alternateText?: string ;
    isSelected?:boolean;
    type?:number;
    order?:number;
    delimiterForMerging?:string;
    group?:string;
    groupNumber?:number;
}

export enum IntelliSenseType {

    None = 0,
    Action = 1,
    Target = 2,
    ActionParams = 3,
    ActionParamValue=4
}


export interface ClientRect{
    left:number;
    top:number;
}