import DynamicsWebApi from 'dynamics-web-api';
import {handleCrmUserActions} from '../CLI/User/CrmUserService';
import IsEmpty from 'is-empty';


export function PerformCrmAction(cliData, onactionCompleteCallback) {

    if (IsEmpty(cliData) || IsEmpty(cliData.action))
        return;

    var action = cliData.action;
    var actionParams = cliData.actionParams;

    switch (action.toLowerCase()) {
        case "open-user": handleCrmUserActions(actionParams,onactionCompleteCallback);
            break;
    }

}




