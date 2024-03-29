import React, { useEffect, useState, useRef } from "react";
import store from "../../store/store";
import * as crmUtil from "../../helpers/crmutil";
import Input from "../../components/UI/Input/Input";
import ProgressBar from "../../components/UI/ProgressBar/ProgressBar";
import Notification from "../../components/UI/Notification/Notification";
import EntityMultiSelect from "../../components/CRM/EntityMultiSelect/EntityMultiSelect";
import IsEmpty from "is-empty";
import { AnchorButton } from "../../components/UI/AnchorButton/AnchorButton";
import { getEntities } from "../../services/CrmMetadataService";
import "./GuidSearch.css";
import {
  getCurrentOrgUrl,
  batchRetrieveMultipleRequests
} from "../../helpers/webAPIClientHelper";
import { EntityMetadata } from "../../interfaces/EntityMetadata";

const { clipboard } = window.require('electron');


export const GuidSearch: React.FC = () => {

  const guidEl: any = useRef(null);

  useEffect(() => {

    guidEl?.current?.focus();
  }, []);


  const [entities, setEntities] = useState([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchInProcess, setSearchInProcess] = useState(false);
  const [entitiesToSearchOn, setEntitiesToSearchOn] = useState([]);
  const [allEntitiesCheck, setAllEntitiesCheck] = useState({
    id: "allEntitites",
    elementType: "inputChk",
    elementConfig: {
      type: "checkbox"
    },
    checked: true,
    value: ""
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
      type: "text",
    },
    value: "",
    entity: "",
    inputState: "is-static"

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

    let entitiesFromCrm = entities.map((entityObj: any) => {
      const entity: any = {};
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
      entity.IsCustomizable = entityObj.IsCustomizable;
      entity.OwnershipType = entityObj.OwnershipType;
      entity.ExternalName = entityObj.ExternalName;

      return entity;
    });

    entitiesFromCrm = entitiesFromCrm.filter((x: any) => {
      return (
        x.PrimaryNameAttribute != null &&
        x.PrimaryIdAttribute != null &&
        x.OwnershipType !== "None" &&
        x.IsCustomizable && x.IsCustomizable.Value &&
        x.ExternalName == null &&
        !x.PrimaryNameAttribute.endsWith("idname")
      );
    });

    entitiesFromCrm = entitiesFromCrm.sort((a: any, b: any) =>
      a.DisplayName.localeCompare(b.DisplayName)
    );

    setEntities(entitiesFromCrm);
  };

  const onClearClick = () => {
    updateGuidToSearch("");
    updateMatchedRecord("", "");
    updateAllEntitiesCheck(true);
    setNoResultsFound(false);
    setEntitiesToSearchOn([]);
  };

  const updateGuidToSearch = (value: any) => {
    let guid = { ...guidToSearch };
    guid.value = value;

    setGuidToSearch(guid);
  };
  const updateAllEntitiesCheck = (isChecked: boolean) => {
    const allEntCheck = { ...allEntitiesCheck };
    allEntCheck.checked = isChecked;

    setAllEntitiesCheck(allEntCheck);
  };

  const onSearchClick = async () => {

    updateMatchedRecord(null, "");
    setNoResultsFound(false);

    let guidToSearchOn = guidToSearch.value;
    if (IsEmpty(guidToSearchOn)) {
      //To Do show indicator that the guid is required
      return;
    }

    let entitiesToSearch = null;

    if (!IsEmpty(entitiesToSearchOn) && entitiesToSearchOn.length >= 1) {
      entitiesToSearch = entitiesToSearchOn.map(x => {
        return entities.find((y: any) => y.LogicalName === x);
      });
    } else {
      entitiesToSearch = [...entities];
    }

    if (entities == null || entities.length === 1) return;

    setSearchInProcess(true);

    let retrieveMultipleRequestsForSearch = entitiesToSearch.map((x: EntityMetadata | undefined) => {
      return {
        collection: x?.EntitySetName,
        select: [x?.PrimaryIdAttribute, x?.PrimaryNameAttribute],
        filter: `${x?.PrimaryIdAttribute} eq ${guidToSearchOn}`,
        maxPageSize: 1
      };
    });

    let result = await performSearch(retrieveMultipleRequestsForSearch);

    if (result != null) {
      let currentOrgUrl = getCurrentOrgUrl();

      let url = crmUtil.getRecordUrl(
        result.LogicalName,
        result.Id
      );

      updateMatchedRecord(result, url);
    } else {
      setNoResultsFound(true);
    }

    setSearchInProcess(false);
  };

  const updateMatchedRecord = (result: any, url: string) => {
    let record = { ...matchedRecord };

    record.entity = result != null ? result.LogicalName : "";
    record.value = result != null ? result.Name : "";
    record.url = result != null ? url : "";

    setMatchedRecord(record);
  };

  const performSearch = async (retrieveMultipleRequestsForSearch: any) => {
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
    } catch (error: any) {
      console.log("Error occurred." + error.message);
    }

    return matchedRecord;
  };

  const getMatchedRecord = (matchedEntity: any) => {
    let matchedRecord = null;
    let entityMetadata: any = getEntityMetadata(matchedEntity.oDataContext);
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

  const getEntityMetadata = (oDataContext: string) => {
    let indexOfHash = oDataContext.indexOf("#");
    let entityInfo = oDataContext
      .substring(indexOfHash + 1)
      .replace("(", "|")
      .replace(")", "");

    let entityArr = entityInfo.split("|");
    let entitySetName = entityArr[0];
    let entityLogicalName = entitySetName.slice(0, -1);

    let entityMetadata: any = entities.find(
      (x: any) => x.LogicalName === entityLogicalName
    );
    return entityMetadata;
  };

  const onEntitySelectChange = (selectedEntities: any) => {
    setEntitiesToSearchOn(selectedEntities);
  };

  const inputChangedHandler = (event: any, id: string) => {
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
    } else if (id === "matchedInput") {
      clipboard.writeText(matchedRecord.url);
    }
  };



  let entitiesToSearch = null;

  if (!allEntitiesCheck.checked) {
    entitiesToSearch = (
      <EntityMultiSelect
        label="Entities to Search"
        entities={entities}
        changed={onEntitySelectChange}
        selections={entitiesToSearchOn}
        is-small
      />
    );
  }

  let matchedRecordUI = null;

  if (!IsEmpty(matchedRecord.value)) {
    matchedRecordUI = (

      <div className="notification match-cont">
        <div className="notification-title">
          <h3 className="title is-4">Match found!</h3>
        </div>
        <div className="record-info">

          <div className="match-entity">
            <Input
              id={matchedRecord.id}
              elementType={matchedRecord.elementType}
              elementConfig={matchedRecord.elementConfig}
              size="is-small"
              inputState={matchedRecord.inputState}
              value={matchedRecord.entity}
              label="Entity"
            />
          </div>

          <div className="match-record">
            <Input
              id={matchedRecord.id}
              elementType={matchedRecord.elementType}
              elementConfig={matchedRecord.elementConfig}
              size="is-small"
              inputState={matchedRecord.inputState}
              value={matchedRecord.value}
              label="Name"
            />
          </div>

          <div className="match-record-link">
            <AnchorButton
              iconName="copy"
              classes={["is-small", "matched-link"]}
              iconClasses={["has-text-grey-darker"]}
              tooltip="Copy URL to clipboard"
              onClick={(event: any) => inputChangedHandler(event, matchedRecord.id)}
            />
          </div>
        </div>
      </div>

    );
  }

  let progressbarUI = null;

  if (searchInProcess) {
    progressbarUI = (
      <ProgressBar progressClasses={["is-small", "is-link"]} />
    );
  }

  let noResultsNotificationUI = null;

  if (noResultsFound) {
    noResultsNotificationUI = (
      <Notification message="No records have been found that match the guid." />
    );
  }

  return (
    <React.Fragment>
      <div className="columns is-desktop">
        <div className="column is-half">
          <div className="buttons" style={{ marginBottom: 0 }}>
            <AnchorButton
              classes={["button", "is-radiusless", "is-white"]}
              disabled={searchInProcess}
              onClick={onSearchClick}
              iconClasses={["icon", "is-small"]}
              iconName="search"
              label="Search"
            />

            <AnchorButton
              classes={["button", "is-radiusless", "is-white"]}
              disabled={searchInProcess}
              onClick={onClearClick}
              iconClasses={["icon", "is-small"]}
              iconName="eraser"
              label="Clear"
            />

          </div>
          <hr className="hr" style={{ marginTop: 0 }}></hr>

          {progressbarUI}

          {noResultsNotificationUI}

          {matchedRecordUI}

          <Input
            id={guidToSearch.id}
            refrnc={guidEl}
            elementType={guidToSearch.elementType}
            elementConfig={guidToSearch.elementConfig}
            size="is-small"
            value={guidToSearch.value}
            changed={(event: any) => inputChangedHandler(event, guidToSearch.id)}
            label="Guid"
          />

          <Input
            id={allEntitiesCheck.id}
            elementType={allEntitiesCheck.elementType}
            elementConfig={allEntitiesCheck.elementConfig}
            size="is-small"
            checked={allEntitiesCheck.checked}
            clicked={(event: any) => inputChangedHandler(event, allEntitiesCheck.id)}
            changed={(event: any) => inputChangedHandler(event, allEntitiesCheck.id)}
            value={allEntitiesCheck.value}
            label="All Entities"
          />
          {entitiesToSearch}
        </div>
      </div>

    </React.Fragment>
  );
};


