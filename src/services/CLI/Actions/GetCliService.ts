
import { CliData, ActionParam } from "../../../interfaces/CliData"
import { CliResponse } from "../../../interfaces/CliResponse"
import { retrieveMultiple, retrieveEntitites, retrieveEntity, retrieveAttribute, retrieveAttributes } from "../../../helpers/webAPIClientHelper"
import { getErrorResponse } from "../CliResponseUtil";
import { getArrayFromCSV, getParamVal, getAttributeMetadataName } from "../../../helpers/common";
import { getEntityMetadataBasic } from "../../CrmMetadataService"
import {
  STR_ERROR_OCCURRED
} from "../../../helpers/strings";
import { async } from "q";
import { expand } from "../../../interfaces/expand";
import { EntityMetadata } from "../../../interfaces/EntityMetadata";

export const handleCrmGetActions = async (cliData: CliData) => {
  let cliResponse: CliResponse = { message: "", success: false, type: "json" };

  try {


    let responseData = null;
    switch (cliData.target.toLowerCase()) {

      case "entity": responseData = await getEntity(cliData);
        cliResponse.response = responseData;
        break;

      case "entities": responseData = await getEntities(cliData);
        cliResponse.response = responseData;
        break;

      case "attribute":
      case "attributes": responseData = await getAttributeData(cliData);
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
    throw new Error("Please specify the parameters and try again.");

  let nameParam: ActionParam = getActionParam("name", actionParams);
  let propertiesParam: ActionParam = getActionParam("properties", actionParams);
  let expandParam: ActionParam = getActionParam("expand", actionParams);

  if (nameParam == undefined)
    throw new Error(`Name parameter to specify the entity cannot be empty. Please provide the parameter and try again`);

  let attributes = propertiesParam ? getArrayFromCSV(propertiesParam.value) : undefined;
  let retrieveEntityResponse = await retrieveEntity(`LogicalName='${nameParam.value}'`, attributes, undefined);

  return retrieveEntityResponse;

}


const getEntities = async (cliData: CliData) => {
  let actionParams = cliData.actionParams;
  if (actionParams == null)
    throw new Error("Please specify the parameters and try again.");


  let namesParam: ActionParam = getActionParam("names", actionParams);
  let propertiesParam: ActionParam = getActionParam("properties", actionParams);
  let filterParam: ActionParam = getActionParam("filter", actionParams);


  let properties = propertiesParam ? getArrayFromCSV(propertiesParam.value) : getDefaultEntityAttributes();
  let names = namesParam ? getArrayFromCSV(namesParam.value) : undefined;
  let filter = filterParam ? filterParam.value : undefined;
  if (names) {
    filter = "";
    for (let i = 0; i < names.length; i++) {
      let entityMetadata = await getEntityMetadataBasic(names[i]) as EntityMetadata;
      filter += `LogicalName eq '${entityMetadata.LogicalName}' or `;
    }
    filter = filter.slice(0, -4);//removes the or condition for the last statement
  }

  if (!filter) {
    throw new Error(`Filter parameter cannot be empty when the Names parameter is not specified. Please provide the parameter and try again or specify the Names parameter using CSV of Entity logical names.`);
  }

  let retrieveEntitiesResponse = await retrieveEntitites(properties, filter);

  return retrieveEntitiesResponse;

}

const getAttributeData = async (cliData: CliData) => {
  let actionParams = cliData.actionParams;
  if (actionParams == null)
    throw new Error("Please specify the parameters and try again.");

  let entityParam: ActionParam = getActionParam("entity", actionParams);
  let attributeParam: ActionParam = getActionParam("attribute", actionParams);
  let typeParam: ActionParam = getActionParam("type", actionParams);
  let propertiesParam: ActionParam = getActionParam("properties", actionParams);
  let expandParam: ActionParam = getActionParam("expand", actionParams);
  let filterParam: ActionParam = getActionParam("filter", actionParams);

  if (entityParam == undefined)
    throw new Error(`Entity parameter required. Please provide both the parameter and try again.`);

  let properties = propertiesParam ? getArrayFromCSV(propertiesParam.value) : undefined;

  let expandArr: expand[] = Array<expand>();
  if (expandParam) {
    let expandAtts = expandParam ? getArrayFromCSV(expandParam.value) : undefined;

    if (expandAtts && expandAtts.length > 0) {
      //to do
    }

  }

  let type = typeParam ? typeParam.value as string : undefined;

  if (type) {
    if (!type.startsWith("Microsoft.Dynamics.CRM.") && !type.endsWith("AttributeMetadata")) {
      let attributeMetadataName = getAttributeMetadataName(type);
      type = `Microsoft.Dynamics.CRM.${attributeMetadataName}AttributeMetadata`;
    }
  }

  if (cliData.target.toLowerCase() === "attribute") {
    if (attributeParam == undefined)
      throw new Error(`Attribute parameter required. Please provide both the parameter and try again.`);

    let retrieveAttributeResponse = await retrieveAttribute(
      getAlternateKey(entityParam.value),
      getAlternateKey(attributeParam.value),
      type,
      properties,
      undefined
    );
    return retrieveAttributeResponse;
  }
  else {
    let retrieveAttributesResponse = await retrieveAttributes(
      getAlternateKey(entityParam.value),
      type,
      properties,
      getParamVal(filterParam),
      getParamVal(expandParam)
    );
    return retrieveAttributesResponse;

  }


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


const getAlternateKey = (keyVal: string): string => {
  keyVal = keyVal.trim();
  return `LogicalName='${keyVal}'`;
}



const getRequestBody = async (cliData: CliData) => {


  let actionParams = cliData.actionParams;
  if (actionParams == null)
    return null;

  let filterParam: ActionParam = getActionParam("filter", actionParams);
  let selectParam: ActionParam = getActionParam("select", actionParams);
  let topParam: ActionParam = getActionParam("top", actionParams);



  let entityMetadata = await getEntityMetadataBasic(cliData.target) as EntityMetadata;

  let retrieveMultipleRequest: any = {};
  retrieveMultipleRequest.collection = entityMetadata.EntitySetName;



  if (filterParam != null && filterParam.value != null) {
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

  if (topParam != null && topParam.value != null) {
    retrieveMultipleRequest.top = topParam.value;
  }


  return retrieveMultipleRequest;

}


const getActionParam = (parameterName: string, actionParams: Array<ActionParam>): ActionParam => {
  let match: ActionParam = actionParams.find(x => x.name != null && x.name.toLowerCase().trim() === parameterName.trim().toLowerCase()) as ActionParam;
  return match;
}


const getPrimaryIdAttribute = (collectionName: string): string => {


  if (collectionName == null)
    return "";

  return `${collectionName.slice(0, -1).toLowerCase()}id`;

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