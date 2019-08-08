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
  let entitiesAttributes = getEntitiesAttributeCollectionFromStore(entityName);

  let entityAttributeCollection = entitiesAttributes != null ? entitiesAttributes.find(
    x => x.Logicalname === entityName
  ) : null;

  if (entityAttributeCollection == null || entityAttributeCollection.Attributes == null || entityAttributeCollection.Attributes.length === 0) {
    const attributeProperties = getAttributeProperties();

    let retrieveAttributesResponse = await retrieveAttributes(
      `LogicalName='${entityName}'`,
      null,
      attributeProperties,
      null,
      null
    );

    var attributes = retrieveAttributesResponse.value;


    let entityMetadata = await getEntityMetadata(entityName);


    entityAttributeCollection = {
      LogicalName: entityName,
      Attributes: attributes,
      LogicalCollectionName: entityMetadata.LogicalCollectionName,
      ObjectTypeCode:entityMetadata.ObjectTypeCode,
      SchemaName:entityMetadata.SchemaName
    };

    if (entitiesAttributes == null) {
      entitiesAttributes = [];
    }
    entitiesAttributes.push(entityAttributeCollection);
    updateEntitiesAttributesInStore(entitiesAttributes);
  }

  return entityAttributeCollection;
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

function getAttributeProperties() {
  let attributeProperties = [
    "DisplayName",
    "AttributeTypeName",
    "LogicalName",
    "SchemaName"
  ];

  return attributeProperties;
}
