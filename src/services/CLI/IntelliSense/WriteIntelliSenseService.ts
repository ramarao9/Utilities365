import { ActionParam, CliData } from "../../../interfaces/CliData";
import {  getEntity } from "../../CrmMetadataService"
import {  CLIVerb } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import {  getCLIVerbsForAttributes, getLastParam, isLastParamOptionSetAttribute, getPicklistAttributeVerbs } from "../../../helpers/cliutil";

import { CRMOperation } from "../../../interfaces/CRMOperation";
import { CLI_ACTION_PARAMS_UPDATE_RECORDS } from "../Definitions/ActionParams/Update";




export const getActionsParamsForWrite = async (userInput: string, cliDataVal: CliData, crmOperation: CRMOperation) => {
    let cliResults: Array<CLIVerb> = [];
    let entitySetName = cliDataVal.target;
    let entityMetadata = await getEntity(entitySetName) as EntityMetadata;

    if (crmOperation === CRMOperation.Update) {
        cliResults = cliResults.concat(CLI_ACTION_PARAMS_UPDATE_RECORDS);//Default targets
    }

    let attributeVerbs = getCLIVerbsForAttributes(entityMetadata, undefined, undefined, true);
    cliResults = cliResults.concat(attributeVerbs);


    let lastParam: ActionParam | undefined = getLastParam(cliDataVal);
    if (!lastParam)
        return cliResults;

    let actionParams = cliDataVal.actionParams;

    let paramName = lastParam.name.toLowerCase()
    let populatedActionParams = actionParams!!.filter(x => x.name && x.value && x.name !== paramName);

    //Remove the previously populated items
    cliResults = cliResults.filter(x => {
        return populatedActionParams.findIndex(y => y.name === x.text) === -1;
    });

    if (paramName === null) {
        return cliResults;
    }

    let attributesMetadata = entityMetadata.Attributes;
    let isOptionSetAttribute = isLastParamOptionSetAttribute(lastParam, attributesMetadata);
    if (isOptionSetAttribute && !lastParam.value) {
        let optionSetAttribute = entityMetadata.PicklistAttributes.find(x => x.LogicalName === lastParam?.name);
        if (optionSetAttribute) {//e.g. update contact --id {id} --gendercode {we display the options here}
            cliResults = getPicklistAttributeVerbs(optionSetAttribute);
            return cliResults;
        }
    }


    if (paramName && paramName.length > 0 && !lastParam.value) {//No param has been completely matched.In this case just filter the results
        cliResults = cliResults.filter(x => (x.text && x.text!!.toLowerCase().startsWith(paramName!!)) ||
            x.name.toLowerCase().startsWith(paramName!!));
    }

    return cliResults;
}

