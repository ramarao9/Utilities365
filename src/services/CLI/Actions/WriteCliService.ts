import IsEmpty from "is-empty";
import { create, update, retrieveAll } from "../../../helpers/webAPIClientHelper"
import { CliData } from "../../../interfaces/CliData"
import { CliResponse, CliResponseType } from "../../../interfaces/CliResponse"
import { EntityMetadata, PicklistMetadata, Option, OptionData } from "../../../interfaces/EntityMetadata"
import { getErrorResponse } from "../CliResponseUtil";
import { getActionParam, removeActionParam, getArrayFromCSV, hasActionParam, getReferencingEntityNavPropertyName, isValidGuid } from "../../../helpers/common";
import {
  getEntityMetadataBasic,
  getEntity
} from "../../CrmMetadataService";

import {
  STR_ERROR_OCCURRED
} from "../../../helpers/strings";
import { EntityReference } from "../../../interfaces/EntityReference";
import { ActivityParty, ParticipationTypeMask } from "../../../interfaces/Entities/ActivityParty";
import { PartyList } from "../../../interfaces/Entities/PartyList";

export const handleCrmCreateActions = async (cliData: CliData) => {
  let cliResponse: CliResponse = { message: "", success: false, type:CliResponseType.None};

  try {
    let createResponse = await createRecord(cliData);
    cliResponse.success = true;
    cliResponse.message = `Created! Id:${createResponse}`;
    cliResponse.response = createResponse;
  }
  catch (error: any) {
    console.log(error);
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }


  return cliResponse;
};


export const handleCrmUpdateActions = async (cliData: CliData) => {

  let cliResponse: CliResponse = { message: "", success: false, type: CliResponseType.None };

  try {

    let hasSelectParam = hasActionParam("select", cliData.actionParams);


    let updateResponse = await updateRecord(cliData);
    cliResponse.success = true;
    cliResponse.message = "Update successfull!";
    cliResponse.response = updateResponse;

    if (hasSelectParam) {
      cliResponse.type = CliResponseType.JSON;
    }
  }
  catch (error: any) {
    console.log(error);
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }


  return cliResponse;

}

const createRecord = async (cliData: CliData) => {

  let targetEntityMetadata: EntityMetadata = await getEntity(cliData.target);

  let createRequest = await getRequestBody(targetEntityMetadata, cliData);

  let recordId = await create(createRequest, targetEntityMetadata.LogicalCollectionName);

  return recordId;

};


const updateRecord = async (cliData: CliData) => {

  let targetEntityMetadata: EntityMetadata = await getEntity(cliData.target);

  if (!cliData.actionParams)
    throw new Error(`Please provide the attributes that needed to be updated and try again.`);

  let idParam = getActionParam("id", cliData.actionParams);
  if (!idParam)
    throw new Error("Please provide the id parameter for the record that needs to be updated");

  cliData.actionParams = removeActionParam("id", cliData.actionParams);
  if (cliData.actionParams.length === 0)
    throw new Error("Please provide one or more attributes that need to be updated.");


  let prefer;
  let selectAttributes;
  let selectParam = getActionParam("select", cliData.actionParams);
  if (selectParam) {
    cliData.actionParams = removeActionParam("select", cliData.actionParams);//remove the select parameter so the update request doesn't include this

    selectAttributes = getArrayFromCSV(selectParam.value);
    prefer = "return=representation";
  }

  let updateRequest = await getRequestBody(targetEntityMetadata, cliData);
  let updateResponse = await update(idParam.value, updateRequest, targetEntityMetadata.LogicalCollectionName, prefer, selectAttributes);

  return updateResponse.value;

}



const getRequestBody = async (targetEntityMetadata: EntityMetadata, cliData: CliData) => {
  var createRequest: any = {};

  let attributesMetadata = targetEntityMetadata.Attributes;


  let picklistAttributes = targetEntityMetadata.PicklistAttributes;

  let dateTimeAttributes = targetEntityMetadata.DateTimeAttributes;

  let lookupAttributes = targetEntityMetadata.LookupAttributes;




  if (cliData.actionParams != null) {
    for (let i = 0; i < cliData.actionParams.length; i++) {
      let param = cliData.actionParams[i];
      if (param != null && param.name != null && param.value != null) {

        let attributeValue: string = param.value;
        let attributeLogicalName: string = param.name.toLowerCase();
        let attributeMetadata = attributesMetadata?.find(x => x.LogicalName === attributeLogicalName);


        if (attributeMetadata == null)
          throw new Error(`Invalid attribute ${attributeLogicalName}. Please check the attribute and try again`);

        if (attributeValue === "null") {
          createRequest[attributeLogicalName] = null;
          continue;
        }

        let attributeType: string = attributeMetadata["AttributeType"];

        switch (attributeType.toLowerCase()) {

          case "datetime":


            let isValid: boolean = isValidDate(attributeValue);
            if (!isValid) {
              throw new Error(`Invalid date format for ${attributeLogicalName}. Please specify it in a valid format and try again.`);
            }

            let attributeDateTimeMetadata = dateTimeAttributes.find(x => x.LogicalName === attributeLogicalName);
            let dateTimeBehavior: string = attributeDateTimeMetadata!!.DateTimeBehavior.Value;
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

            
          case "decimal":
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


          case "customer":
          case "lookup":


            let lookup = ParseLookupStringIntoEntityReference(attributeValue)!!;
            let attributeLookupMetadata = lookupAttributes.find(x => x.LogicalName === attributeLogicalName);
            let targetGuid = lookup.id;
            let targetLookupEntity = lookup.logicalname;

            if (attributeType.toLowerCase() === "lookup" && attributeLookupMetadata!!.Targets.length === 1) {
              targetLookupEntity = attributeLookupMetadata!!.Targets[0]
            }
            else {

              if (targetLookupEntity == null || targetLookupEntity === "") {

                let possibleTargets = attributeLookupMetadata!!.Targets.join(",")

                throw new Error(`Unable to determine the target lookup entity for ${attributeLogicalName}. Please specify one of the following values ${possibleTargets} in the format entityLogicalName_id e.g. campaign_ab37ae59-afe4-eb11-bacb-0022480860c9 and try again.`);
              }


            }

            let targetLookupEntityMetadata = await getEntityMetadataBasic(targetLookupEntity) as EntityMetadata;
            let targetEntityPrimaryIdAttribute = targetLookupEntityMetadata.PrimaryIdAttribute;
            let targetEntityPrimaryNameAttribute = targetLookupEntityMetadata.PrimaryNameAttribute;
            let targetEntityCollectionName = targetLookupEntityMetadata.LogicalCollectionName;


            let guidIsValid = isValidGuid(targetGuid);
            if (!guidIsValid) {
              let filter: string = `${targetEntityPrimaryNameAttribute} eq '${attributeValue}'`;
              if (attributeValue.indexOf("$filter") !== -1) {
                filter = attributeValue.replace("$filter=", "");
              }
              let retrieveResp = await retrieveAll(targetEntityCollectionName, [targetEntityPrimaryIdAttribute], filter);
              if (retrieveResp.value != null && retrieveResp.value.length === 1) {
                let targetEnt: any = retrieveResp.value[0];
                targetGuid = targetEnt[targetEntityPrimaryIdAttribute];
              }
              else {
                continue;
              }
            }
            if (targetGuid != null) {
              let navigationProperty = getReferencingEntityNavPropertyName(targetLookupEntity, attributeLogicalName, targetEntityMetadata.ManyToOneRelationships);
              createRequest[`${navigationProperty}@odata.bind`] = `${targetEntityCollectionName}(${targetGuid})`;
            }
            break;


          case "partylist": let activityParties = await buildActivityParties(targetEntityMetadata.LogicalName, attributeLogicalName, attributeValue);
            if (activityParties == null)
              throw new Error(`Unable to parse the value provided for ${attributeLogicalName} into a Party List. Please try in the following format 'targetentity1_targetguid1|targetentity2_targetguid2' e.g. contact_49a0e5b9-88df-e311-b8e5-6c3be5a8b200|account_6FEF4DE5-9B40-496E-B4BE-71CDBE16B664.`);
            createRequest[attributeLogicalName] = activityParties;
            break;


          default: createRequest[attributeLogicalName] = attributeValue === "null" ? null : attributeValue;
            break;
        }
      }
    }
  }

  return createRequest;
};


const getNavigationPropertyForActivityParty = async (entity: string) => {
  let activityPartyEntityMetadata: EntityMetadata = await getEntity("activityparty");

  let entityActivityPartyRelationship = activityPartyEntityMetadata.ManyToOneRelationships.find(x => x.ReferencedEntity === entity);

  if (entityActivityPartyRelationship == null)
    return null;

  let navigationproperty = entityActivityPartyRelationship.ReferencedEntityNavigationPropertyName;
  return navigationproperty;
}


const buildActivityParties = async (entity: string, partyListAttribute: string, attributeValue: string) => {




  let delimitedparties = attributeValue.split("|");

  let partyList: PartyList = {};

  let activityParties: Array<ActivityParty> = [];

  for (var i = 0; i < delimitedparties.length; i++) {

    let delimitedParty = delimitedparties[i];

    let entityReference = ParseLookupStringIntoEntityReference(delimitedParty);

    let targetEntityMetadata = await getEntityMetadataBasic(entityReference!!.logicalname);

    let participationTypeMask = getParticipationTypeMask(entity, partyListAttribute);
    let activityparty: ActivityParty = { "partyid@odata.bind": `/${targetEntityMetadata.EntitySetName}(${entityReference?.id})`, participationtypemask: participationTypeMask };
    activityParties.push(activityparty);

  }

  if (activityParties.length === 0)
    return null;

  let navigationProperty = await getNavigationPropertyForActivityParty(entity);
  if (navigationProperty == null)
    return null;

  partyList[navigationProperty] = activityParties;

  return partyList;


}


const getParticipationTypeMask = (entity: string, partyListAttribute: string): number => {


  switch (partyListAttribute) {

    case "to": return ParticipationTypeMask.ToRecipient

    case "cc": return ParticipationTypeMask.CCRecipient

    case "bcc": return ParticipationTypeMask.BCCRecipient


  }

  if (partyListAttribute.toLowerCase().includes("customer")) {
    return ParticipationTypeMask.Customer;
  }

  if (partyListAttribute.toLowerCase().includes("owner")) {
    return ParticipationTypeMask.Owner;
  }

  return -1;
}

//Formats date to yyyy-MM-dd
function formatDate(date: string) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function isValidDate(dateStr: string): boolean {


  var parsedDate = Date.parse(dateStr);
  return !isNaN(parsedDate);
}

function getIntegerIfValid(numberStr: string) {



  let numberVal = parseInt(numberStr);

  if (isNaN(numberVal)) {
    return null;
  }

  return numberVal

}

function getFloatIfValid(floatStr: string) {
  let floatVal = parseFloat(floatStr);
  return isNaN(floatVal) ? null : floatVal;
}

function selectedPickList(attributePicklistmetadata: PicklistMetadata, value: string): number {

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


function getAvailableOptionsJSON(attributePicklistmetadata: PicklistMetadata): string {
  let availableOptions = Array<OptionData>();
  attributePicklistmetadata.OptionSet.Options.forEach(option => {
    let optionData = { Label: option.Label.UserLocalizedLabel.Label, Value: option.Value };
    availableOptions.push(optionData);
  });
  let optionsJSON: string = JSON.stringify(availableOptions);
  return optionsJSON;
}



export const ParseLookupStringIntoEntityReference = (lookupString: string): EntityReference | undefined => {


  if (IsEmpty(lookupString))
    return undefined;

  let lookupArr = lookupString.split('_');


  let logicalName = lookupArr.length === 2 ? lookupArr[0] : '';
  let id = lookupArr.length === 2 ? lookupArr[1] : lookupArr[0];

  let lookup: EntityReference = { logicalname: logicalName, id: id, name: '' };
  return lookup;

}

export default handleCrmCreateActions;
