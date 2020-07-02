
import { CliData, ActionParam } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { retrieveMultiple, retrieveEntitites, retrieveEntity,retrieveRequest,
   retrieveAttribute, retrieveAttributes,executeUnboundFunction,retrieve } from "../../../helpers/webAPIClientHelper"
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
  getPrimaryIdAttribute, getFilterWhenAttributes, getOptionSetLabelValues,
  hasActionParamVal, parseQueryFunctionInFilterIfAny
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
        cliResponse.response = cleanEntitiesData(cliData.actionParams as ActionParam[], responseData);
        break;

      case "attribute":
      case "attributes": responseData = await getAttributeData(cliData);

        if (cliData.target.toLowerCase() === "attributes") {
          cliResponse.response = cleanAttributesData(cliData.actionParams as ActionParam[], responseData);
          cliResponse.type = "table";
        }
        else {
          cliResponse.response = responseData;
        }

        break;


      case "org-detail": responseData = await getOrgDetail();
        cliResponse.response = responseData;
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
    throw new Error("Please specify the parameters and try again. Entity parameter must be provided at a minimum.");

  let entityParam = getActionParam("entity", actionParams);
  let propertiesParam = getActionParam("properties", actionParams);
  let expandParam = getActionParam("expand", actionParams);

  if (!entityParam || !entityParam.value)
    throw new Error(`Entity parameter to specify the entity cannot be empty. Please provide the parameter and try again`);

  let entityName = entityParam.value;
  let entityMetadata = await getEntityMetadataBasic(entityName) as EntityMetadata;
  let expandQueryParam = getExpandQueryParam(expandParam, undefined);

  let properties = propertiesParam ? getArrayFromCSV(propertiesParam.value) : undefined;
  let retrieveEntityResponse = await retrieveEntity(`LogicalName='${entityMetadata.LogicalName}'`, properties, expandQueryParam);
  return retrieveEntityResponse;
}


const getEntities = async (cliData: CliData) => {
  let actionParams = cliData.actionParams;

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
  let retrieveAllProperties = hasActionParamVal("all", actionParams);
  let expandParam = getActionParam("expand", actionParams);
  let filterParam = getActionParam("filter", actionParams);



  if (!entityParam || !entityParam.value)
    throw new Error(`Entity parameter required. Please provide both the parameter and try again.`);

  let propertiesCSV = propertiesParam ? propertiesParam.value : undefined;
  let properties = propertiesParam ? getArrayFromCSV(propertiesCSV) : getDefaultAttributeProperties();
  let type = getTypeQueryParam(typeParam);
  let expandQueryParam = getExpandQueryParam(expandParam, type);

  if (retrieveAllProperties) {
    properties = undefined;//will return everything
  }

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
    return retrieveAttributesResponse;
  }


}

const filterOnDisplayNameOrLogicalName = (textToSearch: string, records: Array<any>): Array<any> => {

  if (!records || records.length === 0 || textToSearch === "" || textToSearch == null)
    return records;

  textToSearch = textToSearch.toLowerCase();

  return records.filter(x => (x.LogicalName && x.LogicalName.toLowerCase().includes(textToSearch)) ||
    (x.DisplayName && x.DisplayName.toLowerCase().includes(textToSearch)));

}


const cleanEntitiesData = (actionParams: ActionParam[], responseData: any): any => {

  let data: Array<any> = responseData.value.map((x: any) => {

    if (x.hasOwnProperty("DisplayName")) {
      let localizedLabels = x["DisplayName"].LocalizedLabels;
      let label = getFirstLabelFromLocalizedLabels(localizedLabels);
      x["DisplayName"] = label;
    }

    delete x.MetadataId;

    return x;
  });

  let containsParam = getActionParam("contains", actionParams);

  if (containsParam && containsParam.value) {
    let containsFilter = containsParam.value;
    data = filterOnDisplayNameOrLogicalName(containsFilter, data);
  }

  let cleanedData = { uniqueidattribute: "LogicalName", data: data };
  return cleanedData;

}


const cleanAttributesData = (actionParams: ActionParam[], responseData: any): any => {

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

    delete x.MetadataId;
    delete x["@odata.type"];
    return x;
  });


  let containsParam = getActionParam("contains", actionParams);
  if (containsParam && containsParam.value) {
    let containsFilter = containsParam.value;
    data = filterOnDisplayNameOrLogicalName(containsFilter, data);
  }

  let cleanedData = { uniqueidattribute: "LogicalName", data: data };
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
  let orderByParam = getActionParam("orderby", actionParams);

  let retrieveMultipleRequest: any = {};
  retrieveMultipleRequest.collection = entityMetadata.EntitySetName;


  if (isValidId) {
    retrieveMultipleRequest.filter = `${entityMetadata.PrimaryIdAttribute} eq ${cliData.unnamedParam}`;
  }
  else if (cliData.unnamedParam) {
    retrieveMultipleRequest.filter = `${entityMetadata.PrimaryNameAttribute} eq '${cliData.unnamedParam}'`;
  }
  else if (filterParam != null && filterParam.value != null) {
    let parsedFilter = parseQueryFunctionInFilterIfAny(filterParam.value);
    retrieveMultipleRequest.filter = parsedFilter;
  }

  if (selectParam != null && selectParam.value != null) {
    let attributesCSV = selectParam.value as string;
    retrieveMultipleRequest.select = attributesCSV.split(",");
  }
  else {
    //only bring the Primary Attribute when no attributes provided
    retrieveMultipleRequest.select = entityMetadata.PrimaryNameAttribute ?[entityMetadata.PrimaryIdAttribute,entityMetadata.PrimaryNameAttribute] : [entityMetadata.PrimaryIdAttribute];
  }

  if (!isValidId && topParam != null && topParam.value != null) {
    retrieveMultipleRequest.top = topParam.value;
  }

  if(orderByParam && orderByParam.value){
    retrieveMultipleRequest.orderBy=orderByParam.value.split(",");
  }

  return retrieveMultipleRequest;

}

const getOrgDetail=async ()=>{

  let parameters={
    "AccessType":"Microsoft.Dynamics.CRM.EndpointAccessType'Default'"
  }

  var orgDetailsResponse=await executeUnboundFunction("RetrieveCurrentOrganization",parameters);
  return orgDetailsResponse;
}



const getDefaultEntityAttributes = (): Array<string> => {


  return [
    "DisplayName",
    "LogicalName",
    "ObjectTypeCode",
    "PrimaryNameAttribute"];

}



const getDefaultAttributeProperties = (): Array<string> => {


  return ["DisplayName", "LogicalName", "AttributeType"];

}

