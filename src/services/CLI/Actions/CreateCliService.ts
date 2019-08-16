import IsEmpty from "is-empty";
import { create } from "../../../helpers/webAPIClientHelper"
import { CliData } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { EntityMetadata, PicklistMetadata, Option, OptionData, AttributeMetadata } from "../../../interfaces/EntityMetadata"
import { getErrorResponse, getTextResponse } from "../CliResponseUtil";
import {
  getEntityMetadata,
  getEntityAttributes
} from "../../CrmMetadataService";

import {
  STR_ERROR_OCCURRED
} from "../../../helpers/strings";
import { string } from "prop-types";

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

  let picklistAttributes = targetEntityMetadata.PicklistAttributes;

  if (cliData.actionParams != null) {

    cliData.actionParams.forEach(param => {
      if (param != null && param.name != null && param.value != null) {

        let attributeValue: string = param.value;
        let attributeLogicalName: string = param.name.toLowerCase();
        let attributeMetadata = attributesMetadata.find(x => x.LogicalName === attributeLogicalName);


        if (attributeMetadata == null)
          throw new Error(`Invalid attribute ${attributeLogicalName}. Please check the attribute and try again`);

        let attributeType: string = attributeMetadata["AttributeType"];

        switch (attributeType.toLowerCase()) {

          case "datetime": let isValid: boolean = isValidDate(attributeValue);
            if (!isValid) {
              throw new Error(`Invalid date format for ${attributeLogicalName}. Please specify it in a valid format and try again.`);
            }
            let dateTimeBehavior: string = attributeMetadata.DateTimeBehavior.Value;
            if (dateTimeBehavior.toLowerCase() === "dateonly") {
              createRequest[attributeLogicalName] = formatDate(attributeValue);
            }
            else {
              createRequest[attributeLogicalName] = (new Date(attributeValue)).toISOString();
            }

            break;

          case "integer": let attNumberVal = getIntegerIfValid(attributeValue)
            if (attributeValue != null && attNumberVal == null) {
              throw new Error(`Invalid integer format for ${attributeLogicalName}. Please specify it in a valid format and try again.`);
            }
            createRequest[attributeLogicalName] = attNumberVal;
            break;

          case "double":
          case "money": let floatVal = getFloatIfValid(attributeValue);
            if (attributeValue != null && floatVal == null) {
              throw new Error(`Invalid ${attributeType} format for ${attributeLogicalName}. Please specify it in a valid format and try again.`);
            }
            createRequest[attributeLogicalName] = floatVal;
            break;

          case "picklist":
            let attributePicklistmetadata = picklistAttributes.find(x => x.LogicalName === attributeLogicalName);
            let selectedCode = selectedPickList(attributePicklistmetadata!!, attributeValue);
            if (selectedCode === -1) {
              let availableOptionsJSON = getAvailableOptionsJSON(attributePicklistmetadata!!);
              throw new Error(`Invalid Picklist value for ${attributeLogicalName}. Please specify one of the following values ${availableOptionsJSON} and try again.`);
            }
            createRequest[attributeLogicalName] = selectedCode;
            break;

          case "boolean": createRequest[attributeLogicalName] =
            (attributeValue.toLowerCase() === "y" ||
              attributeValue.toLowerCase() === "true" ||
              attributeValue.toLowerCase() === "1")
            break;

          case "lookup": let targetLookupEntity = attributeMetadata.Targets[0];

            let targetEntityMetadataValue = getEntityMetadata(targetLookupEntity);
           
            //should match lookups on string value
            break;

          default: createRequest[attributeLogicalName] = attributeValue;
            break;
        }





      }
    });
  }

  return createRequest;
};

//Formats date to yyyy-MM-dd
const formatDate = (date: string) => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

const isValidDate = (dateStr: string): boolean => {
  var parsedDate = Date.parse(dateStr);
  return !isNaN(parsedDate);
}

const getIntegerIfValid = (numberStr: string) => {

  let numberVal = parseInt(numberStr);

  if (isNaN(numberVal)) {
    return null;
  }

  return numberVal

}

const getFloatIfValid = (floatStr: string) => {
  let floatVal = parseFloat(floatStr);
  return isNaN(floatVal) ? null : floatVal;
}

const selectedPickList = (attributePicklistmetadata: PicklistMetadata, value: string): number => {

  let selectedCode: number = -1;

  let options: Array<Option> = attributePicklistmetadata.OptionSet.Options;

  let optionSetCode = parseInt(value);

  if (isNaN(optionSetCode)) {
    let option = options.find(x => x.Label.UserLocalizedLabel.Label.toLowerCase() === value.toLowerCase());
    if (option != null) {
      selectedCode = option.Value;
    }
  }
  else {

    let option = options.find(x => x.Value === optionSetCode);
    if (option != null) {
      selectedCode = optionSetCode;
    }

  }

  return selectedCode;
}


const getAvailableOptionsJSON = (attributePicklistmetadata: PicklistMetadata): string => {
  let availableOptions = Array<OptionData>();
  attributePicklistmetadata.OptionSet.Options.forEach(option => {
    let optionData = { Label: option.Label.UserLocalizedLabel.Label, Value: option.Value };
    availableOptions.push(optionData);
  });
  let optionsJSON: string = JSON.stringify(availableOptions);
  return optionsJSON;
}

export default handleCrmCreateActions;
