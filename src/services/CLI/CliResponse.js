export const ELEMENT_TYPE_ERROR = "error";
export const ELEMENT_TYPE_TEXT = "text";

export const getErrorResponse = error => {
  return { type: ELEMENT_TYPE_ERROR, data: error };
};


export const getTextResponse=text=>{
      return { type: ELEMENT_TYPE_TEXT, data: text };
}