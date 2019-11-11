
import { CliData, ActionParam } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { retrieveMultiple, retrieveEntitites, retrieveEntity, retrieveAttribute, retrieveAttributes } from "../../../helpers/webAPIClientHelper"
import { getErrorResponse } from "../CliResponseUtil";
import { getArrayFromCSV, getParamVal, getAttributeMetadataName, getFirstLabelFromLocalizedLabels, isValidGuid } from "../../../helpers/common";
import { getEntityMetadataBasic, getEntity as getEntityMetadata } from "../../CrmMetadataService"
import {
  STR_ERROR_OCCURRED
} from "../../../helpers/strings";
import { async } from "q";
import { expand } from "../../../interfaces/expand";
import { EntityMetadata } from "../../../interfaces/EntityMetadata";

import {
  getTypeQueryParam, getExpandQueryParam, getAlternateKey, getActionParam,
  getPrimaryIdAttribute, getFilterWhenAttributes, getOptionSetLabelValues
} from "../../../helpers/QueryHelper";

export const handleCrmGetActions = async (cliData: CliData) => {
  let cliResponse: CliResponse = { message: "", success: false, type: "json" };

  try {


    let responseData = null;
    switch (cliData.target.toLowerCase()) {

      case "entity": responseData = await getEntity(cliData);
        cliResponse.response = responseData;
        break;

      case "entities": responseData = await getEntities(cliData);
        cliResponse.type = "table";
        cliResponse.response = cleanEntitiesData(responseData);
        break;

      case "attribute":
      case "attributes": responseData = await getAttributeData(cliData);

        if (cliData.target.toLowerCase() === "attributes") {
          cliResponse.response = cleanAttributesData(responseData);
          cliResponse.type = "table";
        }
        else {
          cliResponse.response = responseData;
        }

        break;



      default: responseData = await getRecords(cliData);
        cliResponse.type = "table";
        cliResponse.response = { uniqueidattribute: getPrimaryIdAttribute(cliData.target), data: responseData };
        break;
    }


    cliResponse.success = true;
  }
  catch (error) {
    console.log(error);
    return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
  }


  return cliResponse;
};


const getEntity = async (cliData: CliData) => {

  let actionParams = cliData.actionParams;
  if (actionParams == null)
    throw new Error("Please specify the parameters and try again.");

  let nameParam = getActionParam("entity", actionParams);
  let propertiesParam = getActionParam("properties", actionParams);
  let expandParam = getActionParam("expand", actionParams);

  if (nameParam == undefined)
    throw new Error(`Entity parameter to specify the entity cannot be empty. Please provide the parameter and try again`);

  let attributes = propertiesParam ? getArrayFromCSV(propertiesParam.value) : undefined;
  let retrieveEntityResponse = await retrieveEntity(`LogicalName='${nameParam.value}'`, attributes, undefined);

  return retrieveEntityResponse;

}


const getEntities = async (cliData: CliData) => {
  let actionParams = cliData.actionParams;
  // if (actionParams == null)
  //   throw new Error("Please specify the parameters and try again.");


  let namesParam = getActionParam("entities", actionParams);
  let propertiesParam = getActionParam("properties", actionParams);
  let filterParam = getActionParam("filter", actionParams);


  let properties = propertiesParam ? getArrayFromCSV(propertiesParam.value) : getDefaultEntityAttributes();
  let entities = namesParam ? getArrayFromCSV(namesParam.value) : undefined;
  let filter = filterParam ? filterParam.value : "";
  if (entities) {
    for (let i = 0; i < entities.length; i++) {
      let entityMetadata = await getEntityMetadataBasic(entities[i]) as EntityMetadata;
      filter += `LogicalName eq '${entityMetadata.LogicalName}' or `;
    }
    filter = filter.slice(0, -4);//removes the or condition for the last statement
  }

  // if (!filter) {
  //   throw new Error(`Filter parameter cannot be empty when the Names parameter is not specified. Please provide the parameter and try again or specify the Names parameter using CSV of Entity logical names.`);
  // }

  let retrieveEntitiesResponse = await retrieveEntitites(properties, filter);

  return retrieveEntitiesResponse;

}

const getAttributeData = async (cliData: CliData) => {

  let actionParams = cliData.actionParams;
  if (actionParams == null)
    throw new Error("Please specify the parameters and try again.");

  let entityParam = getActionParam("entity", actionParams);
  let attributeParam = getActionParam("attribute", actionParams);
  let attributesParam = getActionParam("attributes", actionParams);
  let typeParam = getActionParam("type", actionParams);
  let propertiesParam = getActionParam("properties", actionParams);
  let expandParam = getActionParam("expand", actionParams);
  let filterParam = getActionParam("filter", actionParams);

  if (!entityParam || !entityParam.value)
    throw new Error(`Entity parameter required. Please provide both the parameter and try again.`);

  let properties = propertiesParam ? getArrayFromCSV(propertiesParam.value) : getDefaultAttributeProperties();
  let type = getTypeQueryParam(typeParam);
  let expandQueryParam = getExpandQueryParam(expandParam, type);

  if (cliData.target.toLowerCase() === "attribute") {
    if (!attributeParam)
      throw new Error(`Attribute parameter required. Please provide both the parameter and try again.`);

    let retrieveAttributeResponse = await retrieveAttribute(
      getAlternateKey(entityParam.value),
      getAlternateKey(attributeParam.value),
      type,
      properties,
      expandQueryParam
    );

    return retrieveAttributeResponse;
  }
  else {

    let currentFilter = getParamVal(filterParam);
    if (attributesParam && attributesParam.value) {
      currentFilter = getFilterWhenAttributes(attributesParam.value, currentFilter);
    }

    let retrieveAttributesResponse = await retrieveAttributes(
      getAlternateKey(entityParam.value),
      type,
      properties,
      currentFilter,
      expandQueryParam
    );


    // if (!type || type.indexOf("Picklist") != -1) {
    //   let entityMetadata: EntityMetadata = await getEntityMetadata(entityParam.value);
    //   let picklistValues = entityMetadata.PicklistAttributes;    
    // }

    return retrieveAttributesResponse;

  }


}

const cleanEntitiesData= (responseData: any): any => {

  let data: Array<any> = responseData.value.map((x: any) => {

    if (x.hasOwnProperty("DisplayName")) {
      let localizedLabels = x["DisplayName"].LocalizedLabels;
      let label = getFirstLabelFromLocalizedLabels(localizedLabels);
      x["DisplayName"] = label;
    }
    return x;
  });

  let cleanedData = { uniqueidattribute: "MetadataId", data: data };
  return cleanedData;

}


const cleanAttributesData = (responseData: any): any => {

  let data: Array<any> = responseData.value.map((x: any) => {

    if (x.hasOwnProperty("DisplayName")) {
      let localizedLabels = x["DisplayName"].LocalizedLabels;
      let label = getFirstLabelFromLocalizedLabels(localizedLabels);
      x["DisplayName"] = label;
    }

    if (x.hasOwnProperty("OptionSet")) {
      let options = x["OptionSet"].Options;
      let optionSetLabelValues = getOptionSetLabelValues(options);
      x["OptionSet"] = optionSetLabelValues;
    }
    return x;
  });

  let cleanedData = { uniqueidattribute: "MetadataId", data: data };
  return cleanedData;

}

const getRecords = async (cliData: CliData) => {


  let retrieveRequest = await getRequestBody(cliData);

  let retrieveResponse = await retrieveMultiple(retrieveRequest);

  let responseData = retrieveResponse.value;
  if (responseData && responseData.length > 0) {
    responseData.forEach(function (record: any) { delete record["@odata.etag"] });
  }

  return responseData;

};




//Returns the request body need to search Entity records
const getRequestBody = async (cliData: CliData) => {


  let actionParams = cliData.actionParams;
  if (actionParams == null && !cliData.unnamedParam)
    throw new Error(`Provide either the id, name or parameters to filter the records for retrieval.`);


  let entityMetadata = await getEntityMetadataBasic(cliData.target) as EntityMetadata;

  let isValidId = isValidGuid(cliData.unnamedParam);


  let filterParam = getActionParam("filter", actionParams);
  let selectParam = getActionParam("select", actionParams);
  let topParam = getActionParam("top", actionParams);

  let retrieveMultipleRequest: any = {};
  retrieveMultipleRequest.collection = entityMetadata.EntitySetName;


  if (isValidId) {
    retrieveMultipleRequest.filter = `${entityMetadata.PrimaryIdAttribute} eq ${cliData.unnamedParam}`;
  }
  else if (cliData.unnamedParam) {
    retrieveMultipleRequest.filter = `${entityMetadata.PrimaryNameAttribute} eq '${cliData.unnamedParam}'`;
  }
  else if (filterParam != null && filterParam.value != null) {
    retrieveMultipleRequest.filter = filterParam.value;
  }

  if (selectParam != null && selectParam.value != null) {
    let attributesCSV = selectParam.value as string;
    retrieveMultipleRequest.select = attributesCSV.split(",");
  }
  else {
    //only bring the Primary Attribute when no attributes provided
    retrieveMultipleRequest.select = [entityMetadata.PrimaryNameAttribute];
  }

  if (!isValidId && topParam != null && topParam.value != null) {
    retrieveMultipleRequest.top = topParam.value;
  }


  return retrieveMultipleRequest;

}





const getDefaultEntityAttributes = (): Array<string> => {


  return ["ObjectTypeCode",
    "OwnershipType",
    "LogicalName",
    "SchemaName",
    "LogicalCollectionName",
    "EntitySetName",
    "CollectionSchemaName",
    "DisplayName",
    "PrimaryNameAttribute",
    "PrimaryIdAttribute"];

}



const getDefaultAttributeProperties = (): Array<string> => {


  return ["DisplayName", "LogicalName", "AttributeType", "SchemaName"];

}

