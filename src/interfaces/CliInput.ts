export interface CliInput {
    text: string;
    isMultiline?: boolean;
    isPartOfMultiInputRequest?: boolean;
    placeholder?: string;
    step?: number;//identifies which step in the multi input request
}