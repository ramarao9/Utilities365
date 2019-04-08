import React, { Component } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isValidToken } from "../../helpers/crmutil";
import AnchorButton from "../../components/UI/AnchorButton/AnchorButton";
import AdalNode from "adal-node";
import Input from "../../components/UI/Input/Input";
import Crypto from "crypto";

import {
  saveConnection,
  getConnections,
  getConnection,
  removeConnection
} from "../../services/LocalStorageService";
import * as actionTypes from "../../store/actions";
import * as crmUtil from "../../helpers/crmutil";
import "./Auth.css";
const isDev = window.require("electron-is-dev");
const { BrowserWindow } = window.require("electron").remote;



class Auth extends Component {
  state = {
    currentEnv: {},
    connections: getConnections(),
    showNewConnectionUI: false,
    newOrgConnection: {
      name: {
        label: "Name",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Name for the Dynamics 365 Connection."
        },
        value: ""
      },
      orgUrl: {
        label: "Org URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the url of the org"
        },
        value: ""
      },

      applicationId: {
        label: "Azure AD Application Id",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the Azure AD Application Id"
        },
        value: ""
      },
      replyUrl: {
        label: "Reply URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the reply url from the app registration"
        },
        value: ""
      },
      authorizationEndpointUrl: {
        label: "OAuth Authorization URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the OAuth 2.0 Authorization Endpoint"
        },
        value: ""
      },
      saveNewConnection: {
        label: "Save Connection Locally(Access Token)",
        elementType: "inputChk",
        elementConfig: {
          type: "checkbox"
        },
        checked: false
      }
    }
  };

  newConnectionEleChangedHandler = (event, inputIdentifier) => {
    const updatedNewConnectionInfo = {
      ...this.state.newOrgConnection
    };

    const updatedEl = {
      ...updatedNewConnectionInfo[inputIdentifier]
    };

    if (updatedEl.elementType === "inputChk") {
      updatedEl.checked = !updatedEl.checked;
    } else {
      updatedEl.value = event.target.value;
    }

    updatedNewConnectionInfo[inputIdentifier] = updatedEl;

    this.setState({ newOrgConnection: updatedNewConnectionInfo });
  };

  onNewConnectionClick = event => {
   this.showOrHideNewConnectionUI(true);
  };

  connectClick = event => {
    const connectionInfo = this.getNewConnectionInfo();
    //To do validation

    var authorizationUrl = this.getAuthorizationUrl(connectionInfo);
    this.requestAccessToken(authorizationUrl);
  };

  cancelConnectionClick = () => {
    this.showOrHideNewConnectionUI(false);
  };

  showOrHideNewConnectionUI=(show)=>{
    this.setState({ showNewConnectionUI: show });
  }


 onEditConnectionClick=(event, connection)=>{

    
  }


  onDeleteConnectionClick=(event, connection)=>{

 let updatedConnections=  removeConnection(connection.orgUrl);


this.props.onuserUpdated(null);


this.setState({connections:updatedConnections});


  }


 
  connectToExistingOrg = (event, connection) => {

    var authContext = new AdalNode.AuthenticationContext(
      connection.authorizationUrl
    );
    authContext.acquireTokenWithRefreshToken(
      connection.accessToken.refreshToken,
      connection.appId,
      null,
      connection.accessToken.resource,
      this.connectToExistingOrgCallback
    );
  };

  connectToExistingOrgCallback = (error, token) => {

      if (!error) {
         
        let connection= getConnection(token.resource);

        connection.accessToken=token;

        saveConnection(connection);

        

let orgName=connection.name;

this.setUserInfo(token, orgName);


  this.props.onTokenGenerated(token);




 this.props.history.push('/');

        }
        else {

        }

  };

  setUserInfo=(token, orgName)=>{


let userFullName=token.givenName+ " " + token.familyName;
let userId=token.isUserIdDisplayable?token.userId:"";
        let currentUserInfo={name:userFullName,orgName:orgName,userId:userId};

this.props.onuserUpdated(currentUserInfo);
  }

  getAuthorizationUrl = connectionInfo => {
    var state = this.getStateForOAuth();

    var authorizationUrl =
      connectionInfo.authorizationUrl +
      "?response_type=code&client_id=" +
      connectionInfo.appId +
      "&redirect_uri=" +
      connectionInfo.replyUrl +
      "&state=" +
      state +
      "&resource=" +
      connectionInfo.orgUrl;
    return authorizationUrl;
  };

  getNewConnectionInfo = () => {
    const newConnectionInfo = {
      ...this.state.newOrgConnection
    };
    const connName=newConnectionInfo.name.value;
    const orgUrl = newConnectionInfo.orgUrl.value;
    const appId = newConnectionInfo.applicationId.value;
    const replyUrl = newConnectionInfo.replyUrl.value;
    const authorizationUrl = newConnectionInfo.authorizationEndpointUrl.value;
    const saveConnection = newConnectionInfo.saveNewConnection.checked;

    const connectionInfo = {
      name:connName,
      orgUrl: orgUrl,
      appId: appId,
      replyUrl: replyUrl,
      authorizationUrl: authorizationUrl,
      saveConnection: saveConnection
    };

    return connectionInfo;
  };



  requestAccessToken = authorizationUrl => {
    let authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false
    });


if(isDev)
{
  authWindow.webPreferences= {webSecurity: false};
}
    authWindow.loadURL(authorizationUrl);
    authWindow.show();

    authWindow.webContents.on("will-redirect", (event, newUrl) => {
      this.onNavigateToAAD(newUrl, authWindow);
    });

    authWindow.on("closed", () => {
      authWindow = null;
    });
  };

  onNavigateToAAD = (newUrl, authWndw) => {
    const connectionInfo = this.getNewConnectionInfo();

    var queryParams = newUrl.substr(newUrl.indexOf("?"));
    var urlParams = new URLSearchParams(queryParams);

    var code = urlParams.get("code");

    if (code == null || code === "") return;

    var authContext = new AdalNode.AuthenticationContext(
      connectionInfo.authorizationUrl
    );

 

    authContext.acquireTokenWithAuthorizationCode(
      code,
      connectionInfo.replyUrl,
      connectionInfo.orgUrl,
      connectionInfo.appId,
      null,
      this.adalCallback
    );

    if (authWndw) authWndw.destroy();
  };

  getStateForOAuth = () => {
    var stateOAuth = Crypto.randomBytes(64).toString("hex");
    return stateOAuth;
  };

  adalCallback = (error, tokenObj) => {

    let connectionInfo = this.getNewConnectionInfo();
    if (tokenObj != null) {
      this.props.onTokenGenerated(tokenObj);

      let orgName=connectionInfo.name;

this.setUserInfo(tokenObj, orgName);

      if(connectionInfo.saveConnection)
      {
      delete connectionInfo.saveConnection;
      connectionInfo["accessToken"] = tokenObj;
      saveConnection(connectionInfo);
      }
    } else {
      let errMsg =
        "Error occured while retrieving the Token: " + error.message + "\n";
      alert(errMsg);
    }
  };

 
  render() {
    if (isValidToken(this.props.tokenData)) {
      return <Redirect to="/" />;
    }

    const connections = [...this.state.connections];

    if (connections.length > 0 && !this.state.showNewConnectionUI) {
      return (
        <div className="conn-select-box">
        <div>
          <div className="conn-select-box-item">
            <h4 className="title is-4">Pick an Organization</h4>
            {connections.map(connection => (
              <div
                key={connection.orgUrl}
                className="env-cont"
                
              >
                <div className="env-detail" onClick={event => this.connectToExistingOrg(event, connection)}>
                  <span className="org-name">{connection.name}</span>
                  <span className="org-url">{connection.orgUrl}</span>
                </div>
                <div className="env-actions">
                  <span className="icon" onClick={event=>this.onEditConnectionClick(event, connection)}>
                    <FontAwesomeIcon icon="pencil-alt" />
                  </span>

                  <span className="icon" onClick={event=>this.onDeleteConnectionClick(event, connection)}>
                    <FontAwesomeIcon icon="trash-alt" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="new-org-cont">
            <div>
              <AnchorButton
                iconName="plus"
                classes={["is-small"]}
                clicked={event => this.onNewConnectionClick(event)}
                label="New"
              />
            </div>
          </div>
          </div>
        </div>
      );
    }

    const newConnectionElements = [];

    for (let key in this.state.newOrgConnection) {
           newConnectionElements.push({
        id: key,
        config: this.state.newOrgConnection[key]
      });
    }

    let newOrg = (
      <div className="conn-select-box">
        <div className="conn-select-box-item">
          {newConnectionElements.map(connectionEle => (
            <Input
              key={connectionEle.id}
              elementType={connectionEle.config.elementType}
              elementConfig={connectionEle.config.elementConfig}
              size="is-small"
              value={connectionEle.config.value}
              checked={connectionEle.config.checked}
              clicked={event =>
                this.newConnectionEleChangedHandler(event, connectionEle.id)
              }
              changed={event =>
                this.newConnectionEleChangedHandler(event, connectionEle.id)
              }
              label={connectionEle.config.label}
            />
          ))}
        </div>

        <div className="buttons is-right">
          <AnchorButton
            clicked={event => this.connectClick(event)}
            label="Connect"
          />

          <AnchorButton
            clicked={event => this.cancelConnectionClick(event)}
            label="Cancel"
          />
        </div>
      </div>
    );

    return (
      <div>
        {newOrg}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    tokenData: state.tokenData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTokenGenerated: token =>
      dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: token }),
      onuserUpdated:user=>dispatch({type:actionTypes.SET_CURRENT_USER, userInfo:user})
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
