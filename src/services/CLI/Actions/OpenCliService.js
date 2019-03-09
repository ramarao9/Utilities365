import IsEmpty from 'is-empty';
import { handleCrmUserActions } from '../User/CrmUserService';


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
        default:
            break;
    }

}



function openEntityRecord(){

    
}


