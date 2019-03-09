import IsEmpty from 'is-empty';
import { handleCrmUserActions } from '../User/CrmUserService';
import { getCRMRecord } from '../CrmOpenRecordService';
import { getOrgUrl } from '../../../helpers/crmutil';
import { openWindow } from '../../../helpers/util';
export function handleCrmOpenActions(cliData, onactionCompleteCallback) {

    const target = cliData.target;

    if (IsEmpty(target)) {
        onactionCompleteCallback("Unable to determine the target on which " + cliData.action + "  needs to be performed");
        return;
    }

    switch (target.toLowerCase().trim()) {

        case "myuser":
        case "systemuser":
        case "user": handleCrmUserActions(cliData, onactionCompleteCallback);
            break;


        case "advfind":
        case "advancedfind":
        case "search":
            break;


        //Default is opening the entity record using the params
        default: handleOpenRecordAction(cliData,onactionCompleteCallback);
            break;
    }

}



async function handleOpenRecordAction(cliData,onactionCompleteCallback) {

    let result = await getCRMRecord(cliData);

    if (result.entityReference == null) {
        onactionCompleteCallback(result.message);
        return;
    }

    let targetRecord = result.entityReference;
    openRecord(targetRecord);
    onactionCompleteCallback(targetRecord.logicalName + " record "+targetRecord.name +" with id " + targetRecord.id + " opened successfully!");
}





function openRecord(entityreference) {
    const userUrl = getRecordUrl(entityreference.logicalName, entityreference.id);
    openWindow(userUrl, true);
}



function getRecordUrl(logicalName, id) {
    const orgUrl = getOrgUrl();
    const recordUrl = orgUrl + "main.aspx?etn=" + logicalName + "&pagetype=entityrecord&id=%7B" + id + "%7D";
    return recordUrl;
}