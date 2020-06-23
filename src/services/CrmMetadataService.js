import {
  retrieveEntitites,
  retrieveAttributes,
  retrieveEntity
} from "../helpers/webAPIClientHelper";

import store from "../store/store";
import * as actionTypes from "../store/actions";

//Retrieves only the Basic Metadata details on the Entity
export const getEntityMetadataBasic = async entityName => {
  let entities = await getEntities();

  let entityMetadata =
    entities != null ? entities.filter(filterEntityByName, entityName.toLowerCase().trim()) : null;
  return entityMetadata != null && entityMetadata.length === 1
    ? entityMetadata[0]
    : null;
};

export const getEntities = async () => {
  let entities = getEntitiesFromStore();

  if (entities == null || entities.length === 0) {
    let filter = "IsValidForAdvancedFind eq true or ObjectTypeCode lt 10000 and OwnershipType ne 'None' and PrimaryIdAttribute ne null";
    let entityProperties = getEntityProperties();
    let retrieveEntitiesResponse = await retrieveEntitites(
      entityProperties,
      filter
    );

    entities = retrieveEntitiesResponse.value;

    if (entities != null) {
      updateEntitiesInStore(entities);
    }
  }
  return entities;
};

//Returns the complete information including the Attributes, Relationships etc.
export const getEntity = async entityName => {
  let entitiesAttributeMetadata = getEntitiesAttributeCollectionFromStore(entityName);

  let entityMetadata = entitiesAttributeMetadata != null ? entitiesAttributeMetadata.find(
    x => x.LogicalName === entityName
  ) : null;

  if (entityMetadata == null || entityMetadata.Attributes == null || entityMetadata.Attributes.length === 0) {
    let retrieveAttributesResponse = await retrieveAttributes(
      `LogicalName='${entityName}'`,
      null,
      ["DisplayName","AttributeType","LogicalName","IsValidForCreate","IsValidForUpdate"],
      null,
      null
    );

    var attributes = retrieveAttributesResponse.value;


    entityMetadata = await getEntityMetadataBasic(entityName);

    let retrievePicklistResponse = await retrieveAttributes(`LogicalName='${entityName}'`,
      "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
      ["LogicalName","IsValidForCreate","IsValidForUpdate"], null,
      "OptionSet");

    let entityPicklistAttributes = retrievePicklistResponse.value;

    entityMetadata.Attributes = attributes;
    entityMetadata.PicklistAttributes = entityPicklistAttributes;

    let relationships = await getRelationships(entityName);
    entityMetadata.ManyToOneRelationships = relationships.ManyToOneRelationships;

    if (entitiesAttributeMetadata == null) {
      entitiesAttributeMetadata = [];
    }

    entitiesAttributeMetadata.push(entityMetadata);
    updateEntitiesAttributesInStore(entitiesAttributeMetadata);
  }

  return entityMetadata;
};


export const getRelationships = async (entityName) => {


  let entityRelationships = await retrieveEntity(`LogicalName='${entityName}'`, ["LogicalName"], [{ property: "ManyToOneRelationships" }]);

  return entityRelationships;

}



function filterEntityByName(entityMetadata, i, entities) {
  let entityToFilterBy = this;
  return (

    entityMetadata.LogicalName.toLowerCase() === entityToFilterBy ||
    (entityMetadata.LogicalCollectionName && entityMetadata.LogicalCollectionName.toLowerCase() === entityToFilterBy) ||
    (entityMetadata.DisplayName.UserLocalizedLabel != null &&
      entityMetadata.DisplayName.UserLocalizedLabel.Label != null &&
      entityMetadata.DisplayName.UserLocalizedLabel.Label.toLowerCase() ===
      entityToFilterBy)
  );
}

function getEntitiesFromStore() {
  const currentState = store.getState();

  return currentState != null ? currentState.entities : null;
}

function getEntitiesAttributeCollectionFromStore(entityName) {
  const currentState = store.getState();

  let entitiesAttributeCollection =
    currentState != null ? currentState.entitiesAttributeCollection : null;


  return entitiesAttributeCollection;
}

function updateEntitiesInStore(entities) {
  store.dispatch({ type: actionTypes.SET_ENTITIES, entities: entities });
}

function updateEntitiesAttributesInStore(entitiesAttributeCollection) {
  store.dispatch({
    type: actionTypes.SET_ENTITIES_ATTRIBUTE_COLLECTION,
    entitiesAttributeCollection: entitiesAttributeCollection
  });
}

function getEntityProperties() {
  let entityProperties = [
    "DisplayName",
    "LogicalName",
    "DisplayCollectionName",
    "LogicalCollectionName",
    "EntitySetName",
    "ObjectTypeCode",
    "PrimaryNameAttribute",
    "SchemaName",
    "PrimaryIdAttribute"
  ];

  return entityProperties;
}



