import {handleCrmOpenActions} from '../CLI/Actions/OpenCliService';
import IsEmpty from 'is-empty';


export function PerformCrmAction(cliData, onactionCompleteCallback) {

    if (IsEmpty(cliData) || IsEmpty(cliData.action))
        return;

    var action = cliData.action;
    
    switch (action.toLowerCase()) {
        case "open": handleCrmOpenActions(cliData, onactionCompleteCallback);
            break;


    }

}







