export interface CliResponse {
  message: string;
  type: CliResponseType;
  success: boolean;
  response?: any;
  userInputMessage?: string;//needed when the response type is 'requestuserinput' to show as a watermark on the text
}



//to do : create an enum for all the different types


export enum CliResponseType {
  None = "",
  Table = "TABLE",
  Message = "MESSAGE",
  Error = "ERROR",
  JSON = "JSON",
  TEXT = "TEXT",
  RECORD_OPEN = "RECORD_OPEN",
  RequestAdditionalUserInput = "REQUEST_ADDITIONAL_USER_INPUT",
  RequestAdditionalMultiLineUserInput = "REQUEST_ADDITIONAL_MULTI_LINE_USER_INPUT",
  Multi_Input_Response = "MULTI_INPUT_RESPONSE"
}