import { retrieveEntitites } from "../helpers/webAPIClientHelper";

import store from "../store/store";
import * as actionTypes from "../store/actions";

export const getEntityMetadata = async entityName => {


  let entities = await getEntities().value;

  let entityMetadata = entities.filter(filterEntityByName, entityName);
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

    entities = await retrieveEntitiesResponse.value;

    if (entities != null) {
      updateEntitiesInStore(entities);
    }
  }

  return entities;
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

function updateEntitiesInStore(entities) {
  store.dispatch({ type: actionTypes.SET_ENTITIES, entities: entities });
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
