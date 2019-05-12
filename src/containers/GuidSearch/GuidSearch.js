import React, { useEffect, useState, useRef } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import DynamicsWebApi from "dynamics-web-api";
import * as crmUtil from "../../helpers/crmutil";
import * as actionTypes from "../../store/actions";
import Input from "../../components/UI/Input/Input";
import EntityMultiSelect from "../../components/CRM/EntityMultiSelect/EntityMultiSelect";
import Aux from "../../hoc/_Aux/_Aux";
import IsEmpty from "is-empty";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getEntities } from "../../services/CrmMetadataService";
import { getCurrentOrgUrl } from "../../helpers/webAPIClientHelper";

const GuidSearch = () => {
  const [entities, setEntities] = useState([]);
  const [runningLog, setRunningLog] = useState({});
  const [searchInProcess, setSearchInProcess] = useState(false);
  const [entitiesToSearchOn, setEntitiesToSearchOn] = useState([]);
  const [allEntitiesCheck, setAllEntitiesCheck] = useState({
    id: "allEntitites",
    elementType: "inputChk",
    elementConfig: {
      type: "checkbox"
    },
    checked: false
  });
  const [guidToSearch, setGuidToSearch] = useState({
    id: "guidInput",
    elementType: "input",
    elementConfig: {
      type: "text",
      placeholder: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
    },
    value: ""
  });

  const [matchedRecord, setMatchedRecord] = useState({
    id: "matchedInput",
    url: "",
    elementType: "input",
    elementConfig: {
      type: "textAddOn",
      readOnly: "readOnly"
    },
    value: ""
  });

  const getEntitiesFromCRM = async () => {
    let entities = await getEntities();

    let entitiesFromCrm = entities.map(entityObj => {
      const entity = {};
      if (
        entityObj.DisplayName !== null &&
        entityObj.DisplayName.LocalizedLabels !== null &&
        entityObj.DisplayName.LocalizedLabels.length > 0
      ) {
        entity.DisplayName = entityObj.DisplayName.LocalizedLabels[0].Label;
      } else {
        entity.DisplayName = entityObj.LogicalName;
      }
      entity.OTC = entityObj.ObjectTypeCode;
      entity.LogicalName = entityObj.LogicalName;
      entity.PrimaryNameAttribute = entityObj.PrimaryNameAttribute;
      entity.PrimaryIdAttribute = entityObj.PrimaryIdAttribute;
      entity.LogicalCollectionName = entityObj.LogicalCollectionName;
      return entity;
    });

    entitiesFromCrm = entitiesFromCrm.sort((a, b) =>
      a.DisplayName.localeCompare(b.DisplayName)
    );

    setEntities(entitiesFromCrm);
  };

  const onSearchClick = () => {
    setSearchInProcess(true);
    performSearch();
  };

  const performSearch = async () => {
    if (IsEmpty(guidToSearch)) {
      setSearchInProcess(false);
      //To Do show indicator that the guid is required
      return;
    }

    if (!IsEmpty(entitiesToSearchOn) && entitiesToSearchOn.length >= 1) {
      let entityToSearch = entitiesToSearchOn[0];

      //searchCRMEntityWithId(entityToSearch, guidToSearch.value);
    } else {
      setSearchInProcess(false);
    }
  };

  const onEntitySelectChange = selectedEntities => {
    if (IsEmpty(selectedEntities)) return;

    setEntitiesToSearchOn(selectedEntities.split(","));
  };

  const inputChangedHandler = (event, id) => {};

  let entitiesToSearch = null;

  if (!allEntitiesCheck.checked) {
    entitiesToSearch = (
      <EntityMultiSelect
        label="Entities to Search"
        entities={entities}
        changed={onEntitySelectChange}
        is-small
      />
    );
  }

  let matchedRecordUI = null;

  if (!IsEmpty(matchedRecord.value)) {
    matchedRecordUI = (
      <Input
        id={matchedRecord.id}
        elementType={matchedRecord.elementType}
        elementConfig={matchedRecord.elementConfig}
        size="is-small"
        clicked={event => inputChangedHandler(event, matchedRecord.id)}
        value={matchedRecord.value}
        addOnLabel="Copy Link"
        label="Match"
      />
    );
  }

  return (
    <Aux>
      <div className="columns is-desktop">
        <div className="column is-half">
          <div className="buttons">
            <a
              className="button is-radiusless is-white"
              disabled={searchInProcess}
              onClick={onSearchClick}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon="search" />
              </span>
              <span>Search</span>
            </a>

            <a
              className="button is-radiusless is-white"
              disabled={searchInProcess}
              onClick={onSearchClick}
            >
              <span className="icon is-small">
                <FontAwesomeIcon icon="eraser" />
              </span>
              <span>Clear</span>
            </a>
          </div>

          <Input
            id={guidToSearch.id}
            elementType={guidToSearch.elementType}
            elementConfig={guidToSearch.elementConfig}
            size="is-small"
            value={guidToSearch.value}
            changed={event => inputChangedHandler(event, guidToSearch.id)}
            label="Guid"
          />

          <Input
            id={allEntitiesCheck.id}
            elementType={allEntitiesCheck.elementType}
            elementConfig={allEntitiesCheck.elementConfig}
            size="is-small"
            checked={allEntitiesCheck.checked}
            clicked={event => inputChangedHandler(event, allEntitiesCheck.id)}
            value={allEntitiesCheck.value}
            label="All Entities"
          />
          {entitiesToSearch}

          {matchedRecordUI}
        </div>
      </div>
    </Aux>
  );
};

export default GuidSearch;
