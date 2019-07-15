import {
  retrieveEntitites,
  retrieveAttributes
} from "../helpers/webAPIClientHelper";

import store from "../store/store";
import * as actionTypes from "../store/actions";

export const getEntityMetadata = async entityName => {
  let entities = await getEntities();

  let entityMetadata =
    entities != null ? entities.filter(filterEntityByName, entityName) : null;
  return entityMetadata != null && entityMetadata.length == 1
    ? entityMetadata[0]
    : null;
};

export const getEntities = async () => {
  let entities = getEntitiesFromStore();

  if (entities == null || entities.length === 0) {
    let filter = "IsValidForAdvancedFind eq true";
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

export const getEntityAttributes = async entityName => {
  let entityAttributes = getEntityAttributeCollectionFromStore(entityName);

  if (entityAttributes == null || entityAttributes.length === 0) {
    const attributeProperties = getAttributeProperties();

    let retrieveAttributesResponse = await retrieveAttributes(
      `LogicalName='${entityName}'`,
      null,
      attributeProperties,
      null,
      null
    );

    var s = 100;
  }

  return entityAttributes;
};

const getRetrieveAttributesRequest = entityName => {
  const attributeProperties = getAttributeProperties();
  var retrieveAttributesRequest = {
    collection: "EntityDefinitions",
    key: `LogicalName='${entityName}'`,
    navigationProperty: "Attributes",
    navigationPropertyKey: 'LogicalName="firstname"'
  };

  return retrieveAttributesRequest;
};

function filterEntityByName(entityMetadata, i, entities) {
  let entityToFilterBy = this;
  return (
    entityMetadata.LogicalName.toLowerCase() === entityToFilterBy ||
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

function getEntityAttributeCollectionFromStore(entityName) {
  const currentState = store.getState();

  let entityAttributes =
    currentState != null ? currentState.entitiesAttributeCollection : null;

  if (entityAttributes == null) return null;

  let entityAttributeCollection = entityAttributes.find(
    x => x.Logicalname === "entityName"
  );

  return entityAttributeCollection;
}

function updateEntitiesInStore(entities) {
  store.dispatch({ type: actionTypes.SET_ENTITIES, entities: entities });
}

function updateEntityAttributesInStore(entitiesAttributeCollection) {
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

function getAttributeProperties() {
  let attributeProperties = [
    "DisplayName",
    "AttributeTypeName",
    "LogicalName",
    "SchemaName"
  ];

  return attributeProperties;
}
