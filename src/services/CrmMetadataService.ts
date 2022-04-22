import {
  retrieveEntitites,
  retrieveAttributes,
  retrieveEntity
} from "../helpers/webAPIClientHelper";

import store from "../store/store";
import * as actionTypes from "../store/actions";
import { AttributeMetadata, DateTimeMetadata, EntityMetadata, LookupMetadata, PicklistMetadata } from "../interfaces/EntityMetadata";

//Retrieves only the Basic Metadata details on the Entity
export const getEntityMetadataBasic = async (entityName: string) => {
  let entities: EntityMetadata[] = await getEntities();

  let entityMetadata =entities.filter(filterEntityByName, entityName.toLowerCase().trim()) ;
  return entityMetadata[0];
};

export const getEntities = async () => {
  let entities = getEntitiesFromStore();

  if (entities == null || entities.length === 0) {
    let filter = "(IsValidForAdvancedFind eq true or ObjectTypeCode lt 10000) and PrimaryIdAttribute ne null";
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
export const getEntity = async (entityName: string) => {
  let entitiesAttributeMetadata = getEntitiesAttributeCollectionFromStore(entityName);


  

  let entityMetadata: EntityMetadata  = entitiesAttributeMetadata != null ? entitiesAttributeMetadata.find(
    (x: EntityMetadata) => x.LogicalName === entityName || x.EntitySetName===entityName || x.LogicalCollectionName===entityName
  ) : null;


  if (entityMetadata == null || entityMetadata.Attributes == null || entityMetadata.Attributes.length === 0) {
    entityMetadata = await getEntityMetadataBasic(entityName);

    let retrieveAttributesResponse = await retrieveAttributes(
      `LogicalName='${entityMetadata.LogicalName}'`,
      undefined,
      ["DisplayName", "AttributeType", "LogicalName", "IsValidForCreate", "IsValidForUpdate"],
      undefined,
      null
    );

    var attributes = retrieveAttributesResponse.value as AttributeMetadata[];


    

    let retrievePicklistResponse = await retrieveAttributes(`LogicalName='${entityMetadata.LogicalName}'`,
      "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
      ["LogicalName", "IsValidForCreate", "IsValidForUpdate"], undefined,
      "OptionSet");

    let entityPicklistAttributes = retrievePicklistResponse.value as PicklistMetadata[];


    let retrieveDatetimeResponse = await retrieveAttributes(`LogicalName='${entityMetadata.LogicalName}'`,
      "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
      ["LogicalName", "IsValidForCreate", "IsValidForUpdate", "DateTimeBehavior"], undefined,
      null);

    let entityDatetimeAttributes = retrieveDatetimeResponse.value as DateTimeMetadata[];

    let retrieveLookupResponse = await retrieveAttributes(`LogicalName='${entityMetadata.LogicalName}'`,
      "Microsoft.Dynamics.CRM.LookupAttributeMetadata",
      ["LogicalName", "IsValidForCreate", "IsValidForUpdate", "Targets"], undefined,
      null);

    let entityLookupAttributes = retrieveLookupResponse.value as LookupMetadata[];


    if (entityMetadata != null) {


      entityMetadata.Attributes = attributes;
      entityMetadata.PicklistAttributes = entityPicklistAttributes;
      entityMetadata.DateTimeAttributes = entityDatetimeAttributes;
      entityMetadata.LookupAttributes = entityLookupAttributes;

      let relationships = await getRelationships(entityMetadata.LogicalName);
      entityMetadata.ManyToOneRelationships = relationships.ManyToOneRelationships;
    }



    if (entitiesAttributeMetadata == null) {
      entitiesAttributeMetadata = [];
    }

    entitiesAttributeMetadata.push(entityMetadata);
    updateEntitiesAttributesInStore(entitiesAttributeMetadata);
  }

  return entityMetadata;
};


export const getRelationships = async (entityName: string) => {


  let entityRelationships = await retrieveEntity(`LogicalName='${entityName}'`, ["LogicalName"], [{ property: "ManyToOneRelationships" }]);

  return entityRelationships;

}


function filterEntityByName(this: any, entityMetadata: EntityMetadata, i: number, entities: EntityMetadata[]) {


  let entityToFilterBy = (<string><any>this)
  return (

    entityMetadata.LogicalName.toLowerCase() === entityToFilterBy ||
    entityMetadata.EntitySetName.toLowerCase() === entityToFilterBy ||
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

function getEntitiesAttributeCollectionFromStore(entityName: string) {
  const currentState = store.getState();

  let entitiesAttributeCollection =
    currentState != null ? currentState.entitiesAttributeCollection : null;


  return entitiesAttributeCollection;
}

function updateEntitiesInStore(entities: any) {
  store.dispatch({ type: actionTypes.SET_ENTITIES, entities: entities });
}

function updateEntitiesAttributesInStore(entitiesAttributeCollection: any) {
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
    "PrimaryIdAttribute",
    "IsCustomizable",
    "OwnershipType",
    "ExternalName"
  ];

  return entityProperties;
}



