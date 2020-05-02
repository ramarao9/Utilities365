import { CliData } from "../../../interfaces/CliData";
import { CLI_TARGET_GET } from "../Definitions/GetTargetDefinitions"
import { getEntities } from "../../CrmMetadataService"
import { CliIntelliSense, IntelliSenseType, CLIVerb } from "../../../interfaces/CliIntelliSense"
import { EntityMetadata } from "../../../interfaces/EntityMetadata"

export const getTargetGetIntelliSense = async (cliDataVal: CliData) => {

    let cliResults: Array<CLIVerb> = [];
    let targetName = cliDataVal.target;
    let entititesResults = await getEntitiesIntelliSense();
    cliResults = cliResults.concat(CLI_TARGET_GET);//Default targets
    cliResults = cliResults.concat(entititesResults);
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
            name: `${collectionDisplayName}(${entityMetadata.EntitySetName})`,
            text: entityMetadata.EntitySetName
        };
        return cliVerb;
    })

    return cliResults;

}


