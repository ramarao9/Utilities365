
export interface QueryFunction {
    Name: string;
    Parameters: FunctionParameter[];
    ReturnInfo: FunctionReturnType;
    DeclarationTemplate: string;
}

export interface FunctionParameter {
    Name: string;
    Type: string;
    Nullable: boolean;
    Unicode: boolean;
}

export interface FunctionReturnType {
    Type: string;
    Nullable: boolean;
}
