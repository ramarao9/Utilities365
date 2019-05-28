import React, { useEffect, useState, useRef } from "react";
import { Redirect } from "react-router";
import store from "../../store/store";
import DynamicsWebApi from "dynamics-web-api";
import * as crmUtil from "../../helpers/crmutil";
import * as actionTypes from "../../store/actions";
import Input from "../../components/UI/Input/Input";
import EntityMultiSelect from "../../components/CRM/EntityMultiSelect/EntityMultiSelect";
import Aux from "../../hoc/_Aux/_Aux";
import IsEmpty from "is-empty";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getEntities } from "../../services/CrmMetadataService";
import {
  getCurrentOrgUrl,
  batchRetrieveMultipleRequests
} from "../../helpers/webAPIClientHelper";

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

  useEffect(() => {
    const tokenData = store.getState().tokenData;
    if (tokenData != null && tokenData.accessToken != null) {
      getEntitiesFromCRM();
    }

    //
  }, []);

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
      entity.EntitySetName = entityObj.EntitySetName;

      return entity;
    });

    entitiesFromCrm = entitiesFromCrm.filter(x => {
      return (
        x.LogicalName !== "appmodulemetadata" &&
        x.LogicalName !== "appmodulemetadataoperationlog" &&
        x.LogicalName !== "appmodulecomponent" &&
        x.LogicalName !== "appmoduleroles" &&
        x.LogicalName !== "authorizationserver" &&
        x.LogicalName !== "businessdatalocalizedlabel" &&
        x.LogicalName !== "businessprocessflowinstance" &&
        x.LogicalName !== "calendarrule" &&
        x.LogicalName !== "activityparty" &&
        x.LogicalName !== "commitment" &&
        x.LogicalName !== "dependencyfeature" &&
        x.LogicalName !== "dependencynode" &&
        x.LogicalName !== "delveactionhub" &&
        x.LogicalName !== "postfollow" &&
        x.LogicalName !== "fileattachment" &&
        x.LogicalName !== "holidaywrapper" &&
        x.LogicalName !== "imagedescriptor" &&
        x.LogicalName !== "documentindex" &&
        x.LogicalName !== "globalsearchconfiguration" &&
        x.LogicalName !== "customerrelationship" &&
        x.LogicalName !== "childincidentcount" &&
        x.LogicalName !== "knowledgearticleincident" &&
        x.LogicalName !== "knowledgearticleviews" &&
        x.LogicalName !== "leadtoopportunitysalesprocess" &&
        x.LogicalName !== "postlike" &&
        x.LogicalName !== "productpricelevel" &&
        x.LogicalName !== "appmodulemetadatadependency" &&
        x.LogicalName !== "customeropportunityrole" &&
        x.LogicalName !== "integrationstatus" &&
        x.LogicalName !== "msdyn_solutioncomponentsummary" &&
        x.PrimaryNameAttribute != null &&
        !x.PrimaryNameAttribute.endsWith("idname")
      );
    });

    entitiesFromCrm = entitiesFromCrm.sort((a, b) =>
      a.DisplayName.localeCompare(b.DisplayName)
    );

    setEntities(entitiesFromCrm);
  };

  const onSearchClick = async () => {
    let guidToSearchOn = guidToSearch.value;
    if (IsEmpty(guidToSearchOn)) {
      //To Do show indicator that the guid is required
      return;
    }

    let entitiesToSearch =
      !IsEmpty(entitiesToSearchOn) && entitiesToSearchOn.length >= 1
        ? [...entitiesToSearchOn]
        : [...entities];

    if (entities == null || entities.length === 1) return;

    setSearchInProcess(true);

    let retrieveMultipleRequestsForSearch = entitiesToSearch.map(x => {
      return {
        collection: x.EntitySetName,
        select: [x.PrimaryIdAttribute, x.PrimaryNameAttribute],
        filter: `${x.PrimaryIdAttribute} eq ${guidToSearchOn}`,
        maxPageSize: 1
      };
    });

    let matchedRecord = await performSearch(retrieveMultipleRequestsForSearch);

    setSearchInProcess(false);
    debugger;
  };

  const performSearch = async retrieveMultipleRequestsForSearch => {
    let matchedRecord = null;
    try {
      const batchSize = 50;
      const recordsToProcessCount = retrieveMultipleRequestsForSearch.length;
      const totalPages = Math.ceil(recordsToProcessCount / batchSize);
      let currentPage = 1;

      while (currentPage <= totalPages) {
        let currentBatchOfRequests = retrieveMultipleRequestsForSearch.slice(
          (currentPage - 1) * batchSize,
          currentPage * batchSize > recordsToProcessCount
            ? recordsToProcessCount
            : currentPage * batchSize
        );

        let batchResponse = await batchRetrieveMultipleRequests(
          currentBatchOfRequests
        );

        let matchedResponses = batchResponse.filter(
          x => x.value != null && x.value.length === 1
        );

        if (matchedResponses.length === 1) {
          //match found
          let matchedEntity = matchedResponses[0];
          matchedRecord = getMatchedRecord(matchedEntity);
          break;
        }

        currentPage++;
      }
    } catch (error) {
      alert("Error occurred." + error.message);
    }

    return matchedRecord;
  };

  const getMatchedRecord = matchedEntity => {
    let matchedRecord = null;
    let entityMetadata = getEntityMetadata(matchedEntity.oDataContext);
    if (
      matchedEntity != null &&
      matchedEntity.value != null &&
      matchedEntity.value.length === 1
    ) {
      let record = matchedEntity.value[0];
      let id = record[entityMetadata.PrimaryIdAttribute];
      let name = record[entityMetadata.PrimaryNameAttribute];
      matchedRecord = {
        Id: id,
        LogicalName: entityMetadata.LogicalName,
        Name: name
      };
    }

    return matchedRecord;
  };

  const getEntityMetadata = oDataContext => {
    let indexOfHash = oDataContext.indexOf("#");
    let entityInfo = oDataContext
      .substring(indexOfHash + 1)
      .replace("(", "|")
      .replace(")", "");

    let entityArr = entityInfo.split("|");
    let entitySetName = entityArr[0];
    let entityLogicalName = entitySetName.slice(0, -1);

    let entityMetadata = entities.find(
      x => x.LogicalName === entityLogicalName
    );
    return entityMetadata;
  };

  const onEntitySelectChange = selectedEntities => {
    if (IsEmpty(selectedEntities)) return;

    setEntitiesToSearchOn(selectedEntities.split(","));
  };

  const inputChangedHandler = (event, id) => {
    if (id === "guidInput") {
      const guidSearch = {
        ...guidToSearch
      };
      guidSearch.value = event.target.value;

      setGuidToSearch(guidSearch);
    } else if (id === "allEntitites") {
      const allEntitiesChk = {
        ...allEntitiesCheck
      };
      allEntitiesChk.checked = !allEntitiesChk.checked;

      setAllEntitiesCheck(allEntitiesChk);
    }
  };

  const storeData = store.getState();
  if (!crmUtil.isValidToken(storeData.tokenData)) {
    return <Redirect to="/" />;
  }

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
            changed={event => inputChangedHandler(event, allEntitiesCheck.id)}
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
