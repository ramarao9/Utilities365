import { Fragment } from "react";
import { getOdataUrl, getRecordUrl } from "../../../helpers/crmutil";
import { EntityReference } from "../../../interfaces/EntityReference";
import { AnchorButton } from "../AnchorButton/AnchorButton";

import "./RecordInfo.css";
const { clipboard } = window.require('electron');

export const RecordInfo: React.FC<EntityReference> = (recordProps: EntityReference) => {


    const copyIdToClipboard = (event: any, id: string) => {
        clipboard.writeText(id);
    };

    const copyNameToClipboard = (event: any, name: string) => {
        clipboard.writeText(name);
    };


    const copyUrlToClipboard = (event: any, id: string, logicalName: string) => {
        let url = getRecordUrl(logicalName, id);
        clipboard.writeText(url);
    };

    const copyODataToClipboard = (event: any, id: string, entitySetName: string) => {
        let url = getOdataUrl(entitySetName, id);
        clipboard.writeText(url);
    };



    return (
        <div className="ut-ri-cont">
            <div className="ut-ri-name-cont">
                <div className="ut-ri-name">Name : {recordProps.name}</div>
                <AnchorButton
                    iconName="copy"
                    classes={["is-small", "matched-link", "ut-ri-btn"]}
                    iconClasses={["ut-ri-btn-icn"]}
                    tooltip="Copy Name to clipboard"
                    onClick={(event: any) => copyNameToClipboard(event, recordProps.name)}
                />

                <AnchorButton
                    iconName="link"
                    classes={["is-small", "matched-link", "ut-ri-btn"]}
                    iconClasses={["ut-ri-btn-icn"]}
                    tooltip="Copy url to clipboard"
                    onClick={(event: any) => copyUrlToClipboard(event, recordProps.id, recordProps.logicalname)}
                />

                <AnchorButton
                    iconName="table"
                    classes={["is-small", "matched-link", "ut-ri-btn"]}
                    iconClasses={["ut-ri-btn-icn"]}
                    tooltip="Copy OData url to clipboard"
                    onClick={(event: any) => copyODataToClipboard(event, recordProps.id, recordProps.entitySetName!!)}
                />
            </div>
            <div className="ut-ri-id-cont">
                <div className="ut-ri-id">Id: {recordProps.id}</div>
                <AnchorButton
                    iconName="copy"
                    classes={["is-small", "matched-link", "ut-ri-btn"]}
                    iconClasses={["ut-ri-btn-icn"]}
                    tooltip="Copy Id to clipboard"
                    onClick={(event: any) => copyIdToClipboard(event, recordProps.id)}
                />
            </div>
        </div>
    )


}

