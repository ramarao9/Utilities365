import { CliData } from "../../../interfaces/CliData";
import { CliResponse } from "../../../interfaces/CliResponse";
import { getErrorResponse } from "../CliResponseUtil";
import { executeFetchXml } from "../../../helpers/webAPIClientHelper";
import { extractContentFromText } from "../../../helpers/common";
import { getEntityMetadataBasic } from "../../CrmMetadataService"
import { EntityMetadata } from "../../../interfaces/EntityMetadata";
import {
    STR_ERROR_OCCURRED
} from "../../../helpers/strings";


export const handleCrmExecuteActions = async (cliData: CliData) => {
    let cliResponse: CliResponse = { message: "", success: false, type: "" };
    try {
        let responseData = null;
        switch (cliData.target.toLowerCase()) {

            case "fetch":
            case "fetchxml": responseData = await executeFetch(cliData);
                cliResponse.type = "table";
                cliResponse.response = responseData;
                break;
        }
        cliResponse.success = true;
    }
    catch (error) {
        console.log(error);
        return getErrorResponse(`${STR_ERROR_OCCURRED} ${error.message}`);
    }
    return cliResponse;
}


const executeFetch = async (cliData: CliData) => {

    let fetchXml: string = cliData.unnamedParam as string;
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