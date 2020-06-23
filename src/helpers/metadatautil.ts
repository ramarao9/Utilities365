import { EntityMetadata, AttributeMetadata, DisplayName } from "../interfaces/EntityMetadata";


export const getEntityCollectionName = (entityMetadata: EntityMetadata): string => {
    let collectionDisplayName = (entityMetadata.DisplayCollectionName &&
        entityMetadata.DisplayCollectionName.UserLocalizedLabel &&
        entityMetadata.DisplayCollectionName.UserLocalizedLabel.Label) ?
        entityMetadata.DisplayCollectionName.UserLocalizedLabel.Label : entityMetadata.EntitySetName;


    return collectionDisplayName;
}



export const getEntityDisplayLabel = (entityMetadata: EntityMetadata): string => {
    let entityDisplayLabel = getLabelFromDisplayName(entityMetadata.DisplayName);
    if (!entityDisplayLabel) {
        entityDisplayLabel = entityMetadata.LogicalName;
    }
    return entityDisplayLabel;
}



export const getLabelFromDisplayName = (displayName: DisplayName): string | undefined => {

    return (displayName &&
        displayName.UserLocalizedLabel &&
        displayName.UserLocalizedLabel.Label) ?
        displayName.UserLocalizedLabel.Label : undefined;

}



export const getAttributeDisplayName = (attributeMetadata: AttributeMetadata): string => {
    let attributeDisplayName = (attributeMetadata.DisplayName &&
        attributeMetadata.DisplayName.UserLocalizedLabel &&
        attributeMetadata.DisplayName.UserLocalizedLabel.Label) ?
        attributeMetadata.DisplayName.UserLocalizedLabel.Label : attributeMetadata.LogicalName;
    return attributeDisplayName;
}