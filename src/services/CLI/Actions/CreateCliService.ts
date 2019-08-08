import IsEmpty from "is-empty";
import { create } from "../../../helpers/webAPIClientHelper"
import { CliData } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getErrorResponse, getTextResponse } from "../CliResponseUtil";
import {
  getEntityMetadata,
  getEntityAttributes
} from "../../CrmMetadataService";

import {
  STR_ERROR_OCCURRED
} from "../../../helpers/strings";

export const handleCrmCreateActions = async (cliData: CliData) => {
  let cliResponse: CliResponse = { message: "", success: false, type: "" };

  try {
    await createRecord(cliData);
    cliResponse.success = true;
    cliResponse.message = "Record created successfully!";
  }
  catch (error) {
    console.log(error);
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }


  return cliResponse;
};

//
const createRecord = async (cliData: CliData) => {



  let targetEntityMetadata: EntityMetadata = await getEntityAttributes(cliData.target);

  let createRequest = getCreateRequestBody(targetEntityMetadata, cliData);

  let createResponse = await create(createRequest, targetEntityMetadata.LogicalCollectionName);



};

const getCreateRequestBody = (targetEntityMetadata: EntityMetadata, cliData: CliData) => {
  var createRequest: any = {};

  let attributesMetadata = targetEntityMetadata.Attributes;

  if (cliData.actionParams != null) {

    cliData.actionParams.forEach(param => {
      if (param != null && param.name != null && param.value != null) {

        let attributeValue: string = param.value;
        let attributeLogicalName: string = param.name.toLowerCase();
        let attributeMetadata = attributesMetadata.find(x => x.LogicalName === attributeLogicalName);
        if (attributeMetadata != null) {

          let attributeType: string = attributeMetadata["AttributeTypeName"].Value;

          switch (attributeType.toLowerCase()) {

            case "datetimetype":

              break;

            case "integertype":
            case "doubletype":
            case "moneytype":
              break;

            case "picklisttype":
              //To do: should parse string value
              break;

            case "booleantype": createRequest[attributeLogicalName] =
              (attributeValue.toLowerCase() === "y" ||
                attributeValue.toLowerCase() === "true" ||
                attributeValue.toLowerCase() === "1")
              break;

            case "lookuptype":
              //should match lookups on string value
              break;

            default: createRequest[attributeLogicalName] = attributeValue;
              break;
          }


        }


      }
    });
  }

  return createRequest;
};




export default handleCrmCreateActions;
