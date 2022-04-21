import { CliResponseType } from "../../interfaces/CliResponse";

export const ELEMENT_TYPE_ERROR = "error";
export const ELEMENT_TYPE_TEXT = "text";

export const getErrorResponse = (error: string) => {
  return {
    type: CliResponseType.Error,
    message: error,
    response: null,
    success: false
  };
};

export const getTextResponse = (text: string, response?: any) => {
  return {
    type: CliResponseType.TEXT,
    message: text,
    response: response,
    success: true
  };
};


