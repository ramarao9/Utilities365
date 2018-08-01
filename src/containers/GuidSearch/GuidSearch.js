import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import DynamicsWebApi from 'dynamics-web-api';
import * as crmUtil from '../../helpers/crmutil';
import * as actionTypes from '../../store/actions';
import Input from '../../components/UI/Input/Input';
import EntityMultiSelect from '../../components/CRM/EntityMultiSelect/EntityMultiSelect';
import Aux from '../../hoc/_Aux/_Aux';
import IsEmpty from 'is-empty';
import SplitString from 'split-string';



//
class GuidSearch extends Component {
    state = {
        entities: [],
        entitiesToSearchOn: [],
        guidToSearch: {
            id: "guidInput",
            elementType: "input",
            elementConfig: {
                type: "text",
                placeholder: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            },
            value: ""
        },
        allEntitiesCheck: {
            id: "allEntitites",
            elementType: "inputChk",
            elementConfig: {
                type: "checkbox"
            },
            checked: false
        },
        matchedRecord: {
            id: "matchedInput",
            url: "",
            elementType: "input",
            elementConfig: {
                type: "textAddOn",
                readOnly: "readOnly"
            },
            value: ""
        }
    };
    entitiesToSearchOn = [];
    dynamicsWebAPIClient = null



    componentDidMount() {

        if (crmUtil.isValidToken(this.props.tokenData)) {
            this.getEntitiesFromCRM();
        }
    }

    getEntitiesFromCRM = () => {

        this.dynamicsWebAPIClient = new DynamicsWebApi({
            webApiUrl: crmUtil.getResource() + "api/data/v9.0/"
        });




        var request = {
            collection: 'EntityDefinitions',
            select: ['LogicalName', 'SchemaName', 'DisplayName', 'ObjectTypeCode', 'LogicalCollectionName', 'PrimaryIdAttribute'],
            filter: "IsIntersect eq false",
            token: this.props.tokenData.access_token
        };

        this.dynamicsWebAPIClient.retrieveRequest(request).then(this.getEntitiesFromCRMSuccess).catch(function (error) {
            var s = 100;
        });





    }

    getEntitiesFromCRMSuccess = (entityMetadata) => {
        var entitiesFromMetadata = entityMetadata.value;
        const entitiesFromCrm = entitiesFromMetadata.map(entityObj => {

            const entity = {};
            if (entityObj.DisplayName !== null &&
                entityObj.DisplayName.LocalizedLabels !== null &&
                entityObj.DisplayName.LocalizedLabels.length > 0) {
                entity.DisplayName = entityObj.DisplayName.LocalizedLabels[0].Label;
            }
            else {
                entity.DisplayName = entityObj.LogicalName;
            }
            entity.OTC = entityObj.ObjectTypeCode;
            entity.LogicalName = entityObj.LogicalName;
            entity.PrimaryIdAttribute = entityObj.PrimaryIdAttribute;
            entity.LogicalCollectionName = entityObj.LogicalCollectionName;
            return entity;
        });


        this.setState({ entities: entitiesFromCrm });
    }

    onSearchClick = () => {
        var guid = "19229FF1-1C8E-E811-A978-000D3A1C9C85";
        var logicalName = "account";


        this.performSearch();


    }

    performSearch =()=>{
        let guidToSearch = this.state.guidToSearch;


        if(IsEmpty(guidToSearch))
        {

            //To Do show indicator that the guid is required
            return;
        }
        
        if (!IsEmpty(this.entitiesToSearchOn) && this.entitiesToSearchOn.length >= 1) {
            let entityToSearch = this.entitiesToSearchOn[0];

            this.searchCRMEntityWithId(entityToSearch, guidToSearch.value);


        }
    }

    searchCRMEntityWithId = (entityLogicalName, id) => {


        if (!crmUtil.isValidToken(this.props.tokenData)) {
            //Handle Token Generation
        }

        let entities = [...this.state.entities];
        let entityInfo = entities.find(x => x.LogicalName === entityLogicalName);




        var request = {
            collection: entityInfo.LogicalCollectionName,
            select: [entityInfo.PrimaryIdAttribute],
            filter: entityInfo.PrimaryIdAttribute + " eq " + id,
            token: this.props.tokenData.access_token
        };

        //perform a multiple records retrieve operation
        this.dynamicsWebAPIClient.retrieveMultipleRequest(request).then(this.searchCRMEntityWithIdSuccess).catch(function (error) {
            var y = 10;
            var d = 1;
        });

    }

    searchCRMEntityWithIdSuccess = (result) => {

        if (IsEmpty(result.value) || result.value.length === 0) {
            //No Match found remove the entity from 'entitiesToSearchOn'


        }
        else {
            //Match Found quit the search
        }

    }




    inputChangedHandler = (event, inputIdentifier) => {



        if (inputIdentifier === "guidInput") {

            const guidSearch = {
                ...this.state.guidToSearch
            }

            guidSearch.value = event.target.value;
            this.setState({ guidToSearch: guidSearch });

        }
        else if (inputIdentifier === "allEntitites") {

            const allEntitiesChk = {
                ...this.state.allEntitiesCheck
            }
            allEntitiesChk.checked = !allEntitiesChk.checked;

            this.setState({ allEntitiesCheck: allEntitiesChk })

        }

    }


    onEntitySelectChange = (selectedEntities) => {



        if (IsEmpty(selectedEntities))
            return;

        this.entitiesToSearchOn = SplitString(selectedEntities, { separator: ',' });

        // this.setState({ entitiesToSearchOn: entitiesToSearchOnArr });


    }





    render() {
        if (!crmUtil.isValidToken(this.props.tokenData)) {
            return <Redirect to='/Auth' />
        }


        const guidSearchEl = {
            ...this.state.guidToSearch
        }

        const allEntitiesCheckEl = {
            ...this.state.allEntitiesCheck
        }

        const matchedRecordEl = {
            ...this.state.matchedRecord
        }

        let entitiesToSearch = null;

        if (!this.state.allEntitiesCheck.checked) {
            entitiesToSearch = <EntityMultiSelect label="Entities to Search" entities={this.state.entities} changed={this.onEntitySelectChange} is-small />
        }

        return (
            <Aux>
                <div className="columns is-desktop">
                    <div className="column is-half">

                        <div className="buttons">
                            <span className="button is-info" onClick={this.onSearchClick}>Search</span>
                        </div>

                        <Input
                            id={guidSearchEl.id}
                            elementType={guidSearchEl.elementType}
                            elementConfig={guidSearchEl.elementConfig}
                            size="is-small"
                            value={guidSearchEl.value}
                            changed={(event) => this.inputChangedHandler(event, guidSearchEl.id)}
                            label="Guid" />


                        <Input
                            id={allEntitiesCheckEl.id}
                            elementType={allEntitiesCheckEl.elementType}
                            elementConfig={allEntitiesCheckEl.elementConfig}
                            size="is-small"
                            checked={allEntitiesCheckEl.checked}
                            clicked={(event) => this.inputChangedHandler(event, allEntitiesCheckEl.id)}
                            value={allEntitiesCheckEl.value}
                            label="All Entities" />
                        {entitiesToSearch}


                        <Input
                            id={matchedRecordEl.id}
                            elementType={matchedRecordEl.elementType}
                            elementConfig={matchedRecordEl.elementConfig}
                            size="is-small"
                            clicked={(event) => this.inputChangedHandler(event, matchedRecordEl.id)}
                            value={matchedRecordEl.value}
                            addOnLabel="Copy Link"
                            label="Match" />


                    </div>
                </div>
            </Aux>
        );
    }

}
const mapStateToProps = state => {
    return {
        tokenData: state.tokenData
    };

}

const mapDispatchToProps = dispatch => {
    return {
        onTokenRefresh: () => dispatch({ type: actionTypes.REFRESH_ACCESS_TOKEN })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GuidSearch);