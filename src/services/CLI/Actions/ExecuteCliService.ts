import { CliData } from "../../../interfaces/CliData";
import { CliResponse, CliResponseType } from "../../../interfaces/CliResponse";
import { getErrorResponse } from "../CliResponseUtil";
import { executeFetchXml } from "../../../helpers/webAPIClientHelper";
import { extractContentFromText } from "../../../helpers/common";
import { getEntityMetadataBasic } from "../../CrmMetadataService"
import { EntityMetadata } from "../../../interfaces/EntityMetadata";
import {
    STR_ERROR_OCCURRED
} from "../../../helpers/strings";


export const handleCrmExecuteActions = async (cliData: CliData) => {
    let cliResponse: CliResponse = { message: "", success: false, type: CliResponseType.None };
    try {

        switch (cliData.target.toLowerCase()) {

            case "fetchxml": //r
                if (cliData.steps == null || cliData.steps.length === 0) {
                    cliResponse.type = CliResponseType.RequestAdditionalMultiLineUserInput;
                    cliResponse.response = "";
                    cliResponse.userInputMessage = "Please paste Fetch XML here."
                }
                else {
                    cliResponse.response = await executeFetch(cliData);
                    cliResponse.type = CliResponseType.Table;
                    cliResponse.success = true;
                }

                break;
        }
        cliResponse.success = true;
    }
    catch (error: any) {
        console.log(error);
        return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
    }
    return cliResponse;
}


const executeFetch = async (cliData: CliData) => {

    let cliStep = cliData.steps!![0];
    let fetchXml: string = cliStep.text;
    let entityNameTag = extractContentFromText(fetchXml, "<entity", ">");

    if (!entityNameTag)
        throw new Error("Please provide a valid FetchXml");

    let entityName = entityNameTag.replace("name=", "").replace(/"/g, "").replace(/'/g, "").trim();

    let entityMetadata = await getEntityMetadataBasic(entityName) as EntityMetadata;

    var response = await executeFetchXml(entityMetadata.LogicalCollectionName, fetchXml);
    let responseData = response.value;
    if (responseData && responseData.length > 0) {
        responseData.forEach(function (record: any) { delete record["@odata.etag"] });
    }

    return { uniqueidattribute: entityMetadata.PrimaryIdAttribute, data: responseData };

}