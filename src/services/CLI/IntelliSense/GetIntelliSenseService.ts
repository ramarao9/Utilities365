import { CliData } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/GetTargetDefinitions"
import { getEntities } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"
import { getCleanedCLIVerbs } from "../../../helpers/cliutil";

export const getTargetGetIntelliSense = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let targetName = cliDataVal.target;
    let entititesResults = await getEntitiesIntelliSense();
    cliResults = cliResults.concat(CLI_TARGET_GET);//Default targets
    cliResults = cliResults.concat(entititesResults);


    if(targetName){
        cliResults = cliResults.filter(x => x.name.toLowerCase().startsWith(targetName.toLowerCase()) || 
        x.text && x.text.toLowerCase().startsWith(targetName.toLowerCase()));
    }
    
    cliResults = getCleanedCLIVerbs(cliResults);

    return cliResults;
}


const getEntitiesIntelliSense = async () => {

    let cliResults: Array<CLIVerb> = [];
    let entitiesMetadata = await getEntities();

    cliResults = entitiesMetadata.map((entityMetadata: EntityMetadata) => {


        let collectionDisplayName = (entityMetadata.DisplayCollectionName &&
            entityMetadata.DisplayCollectionName.UserLocalizedLabel &&
            entityMetadata.DisplayCollectionName.UserLocalizedLabel.Label) ?
            entityMetadata.DisplayCollectionName.UserLocalizedLabel.Label : entityMetadata.EntitySetName

        let cliVerb: CLIVerb = {
            name: `${collectionDisplayName}`,
            text: entityMetadata.EntitySetName
        };
        return cliVerb;
    });

    cliResults.sort((a,b)=>{return a.name>b.name?1:-1 });


    return cliResults;

}


