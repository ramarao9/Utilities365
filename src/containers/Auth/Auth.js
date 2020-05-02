import React, { Component } from "react";
import { connect } from "react-redux";
import ErrorMessage from "../../components/UI/ErrorMessage/ErrorMessage";
import MoreButton from "../../components/UI/MoreButton/MoreButton";
import { isValidToken } from "../../helpers/crmutil";
import AnchorButton from "../../components/UI/AnchorButton/AnchorButton";
import AdalNode from "adal-node";
import Input from "../../components/UI/Input/Input";
import Crypto from "crypto";
import axios from "axios";
import {
  saveConnection,
  getConnections,
  getConnection,
  removeConnection
} from "../../services/LocalStorageService";

import { retrieveAll } from "../../helpers/webAPIClientHelper";
import * as actionTypes from "../../store/actions";
import "./Auth.css";
import isEmpty from "is-empty";
const isDev = window.require("electron-is-dev");
const { BrowserWindow } = window.require("electron").remote;

class Auth extends Component {
  state = {
    currentEnv: {},
    connectionInProcess: false,
    connectionError: null,
    connections: getConnections(),
    showNewConnectionUI: false,
    connectionInEditMode: null,
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
          placeholder:
            "Provide the Azure AD Application Id e.g. 00000000-0000-0000-0000-000000000000"
        },
        value: ""
      },
      replyUrl: {
        label: "Reply URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the reply url from the app registration if you want to use authorization code authentication"
        },
        value: ""
      },
      clientSecret: {
        label: "Client Secret",
        elementType: "input",
        elementConfig: {
          type: "password",
          placeholder: "Provide the client secret if you want to use client credential grant or S2S authentication"
        },
        value: ""
      },
      saveNewConnection: {
        label: "Save Connection Locally(Access Token/Client Secret)",
        elementType: "inputChk",
        elementConfig: {
          type: "checkbox"
        },
        checked: false
      }
    }
  };


  componentDidUpdate(prevProps) {
    // will be true
    let locationChanged =
      this.props.location !== prevProps.location;


    console.log("Location changed" + locationChanged + " location : " + this.props.history.location);
  }


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

  connectClick = async event => {

    this.setState({ connectionInProcess: true });

    const connectionInfo = this.getNewConnectionInfo();
    //To do validation

    let authorizationUrl = await this.getAuthorizationUrlFromOrgUrl(
      connectionInfo.orgUrl
    );
    connectionInfo.authorizationUrl = authorizationUrl;

    if (!isEmpty(connectionInfo.clientSecret)) {
      var authContext = new AdalNode.AuthenticationContext(
        connectionInfo.authorizationUrl
      );

      authContext.acquireTokenWithClientCredentials(
        connectionInfo.orgUrl,
        connectionInfo.appId,
        connectionInfo.clientSecret,
        this.adalCallback
      );
    } else {
      var authorizationUrlWithParams = this.getAuthorizationUrlWithParams(
        connectionInfo
      );
      this.requestAccessToken(authorizationUrlWithParams, authorizationUrl);
    }
  };

  getAuthorizationUrlFromOrgUrl = async orgUrl => {
    let authorizationUrl = null;
    try {
      await axios.get(`${orgUrl}/api/data`);
    } catch (error) {
      let response = error.response;
      let responseHeaders = response.headers;

      if (
        responseHeaders != null &&
        responseHeaders["www-authenticate"] != null
      ) {
        let authenticateHeader = responseHeaders["www-authenticate"];
        authorizationUrl = this.getAuthorizationUrlFromAuthenticateHeader(
          authenticateHeader
        );
      }
    }

    return authorizationUrl;
  };

  getAuthorizationUrlFromAuthenticateHeader = authenticateHeader => {
    let authorizationUrl = null;
    let authHeaders = authenticateHeader
      .replace("Bearer", "")
      .trim()
      .split(",");

    if (authHeaders.length === 2) {
      authorizationUrl =
        authHeaders[0] != null
          ? authHeaders[0].replace("authorization_uri=", "")
          : null;
    }

    return authorizationUrl;
  };

  requestAccessToken = (authorizationUrlWithParams, authorizationUrl) => {
    let authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false
    });

    if (isDev) {
      authWindow.webPreferences = { webSecurity: false };
    }
    authWindow.loadURL(authorizationUrlWithParams);
    authWindow.show();

    authWindow.webContents.on("will-redirect", (event, newUrl) => {
      this.onNavigateToAAD(newUrl, authWindow, authorizationUrl);
    });

    authWindow.on("closed", () => {
      authWindow = null;
    });
  };

  onNavigateToAAD = (newUrl, authWndw, authorizationUrl) => {
    const connectionInfo = this.getNewConnectionInfo();

    var queryParams = newUrl.substr(newUrl.indexOf("?"));
    var urlParams = new URLSearchParams(queryParams);

    var code = urlParams.get("code");
    var error = urlParams.get("error_description");


    if (code == null || code === "") {
      if (authWndw) authWndw.destroy();
      this.setState({ connectionInProcess: false, connectionError: error });
      return;
    }

    var authContext = new AdalNode.AuthenticationContext(
      authorizationUrl
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

  getNewConnectionInfo = () => {
    const newConnectionInfo = {
      ...this.state.newOrgConnection
    };
    const connName = newConnectionInfo.name.value;
    const orgUrl = newConnectionInfo.orgUrl.value;
    const appId = newConnectionInfo.applicationId.value;
    const replyUrl = newConnectionInfo.replyUrl.value;
    const clientSecret = newConnectionInfo.clientSecret.value;
    const saveConnection = newConnectionInfo.saveNewConnection.checked;

    const connectionInfo = {
      name: connName,
      orgUrl: orgUrl,
      appId: appId,
      replyUrl: replyUrl,
      clientSecret: clientSecret,
      saveConnection: saveConnection
    };

    return connectionInfo;
  };

  getStateForOAuth = () => {
    var stateOAuth = Crypto.randomBytes(64).toString("hex");
    return stateOAuth;
  };

  adalCallback = async (error, tokenObj) => {

    let errorDetail = null;
    let connectionInfo = this.getNewConnectionInfo();
    if (tokenObj != null) {
      this.props.onTokenGenerated(tokenObj);

      let orgName = connectionInfo.name;
      if (connectionInfo.saveConnection) {
        delete connectionInfo.saveConnection;
        connectionInfo["accessToken"] = tokenObj;
        connectionInfo.authorizationUrl = await this.getAuthorizationUrlFromOrgUrl(
          connectionInfo.orgUrl
        );
        saveConnection(connectionInfo);
      }

      await this.setUserInfo(tokenObj, orgName);

      this.props.history.push("/home");
    } else {
      errorDetail = `Error occured while retrieving the Token: + ${error && error.message ? error.message : error}`;
    }

    this.setState({ connectionInProcess: false, connectionError: errorDetail });
  };

  setUserInfo = async (token, orgName) => {
    let userId = token.isUserIdDisplayable ? token.userId : "";
    let userFullName = "";
    if (!token.givenName) {
      let user = await this.getUser(token._clientId.trim());
      userFullName = user.fullname;
      userId = user.domainname;
    } else {
      userFullName = token.givenName + " " + token.familyName;
    }

    let currentUserInfo = {
      name: userFullName,
      orgName: orgName,
      userId: userId
    };

    this.props.onuserUpdated(currentUserInfo);
  };

  getUser = async applicationId => {
    let user = {};
    let users = await retrieveAll(
      "systemusers",
      ["fullname", "domainname"],
      `applicationid eq '${applicationId}'`
    );

    if (users != null && users.value != null && users.value.length === 1) {
      user = users.value[0];
    }
    return user;
  };

  getAuthorizationUrlWithParams = connectionInfo => {
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

  cancelConnectionClick = () => {
    this.setState({ connectionInProcess: false, connectionError: null });
    this.showOrHideNewConnectionUI(false);
  };

  showOrHideNewConnectionUI = show => {
    this.setState({ showNewConnectionUI: show });
  };

  onEnvActionClick = (event, action, connection) => {
    switch (action.id) {
      case "edit":
        this.setState({ connectionInEditMode: connection });
        break;

      case "remove":
        this.deleteConnection(connection);
        break;

      default:
        break;
    }
  };

  onConnectionNameUpdated = ev => {
    let updatedConnectionInEditMode = { ...this.state.connectionInEditMode };

    updatedConnectionInEditMode.name = ev.target.value;

    this.setState({ connectionInEditMode: updatedConnectionInEditMode });
  };

  onUpdateExistingConnection = () => {
    let updatedConnectionInEditMode = { ...this.state.connectionInEditMode };

    saveConnection(updatedConnectionInEditMode);

    let updatedConnections = [...this.state.connections];

    let connectionIndex = updatedConnections.findIndex(
      x => x.orgUrl === updatedConnectionInEditMode.orgUrl
    );

    updatedConnections[connectionIndex] = updatedConnectionInEditMode;

    this.setState({
      connections: updatedConnections,
      connectionInEditMode: null
    });
  };

  onEditConnectionCancel = (event, connection) => {
    this.setState({ connectionInEditMode: null });
  };

  deleteConnection = connection => {
    let updatedConnections = removeConnection(connection.orgUrl);

    this.props.onuserUpdated(null);

    this.setState({ connections: updatedConnections });
  };

  connectToExistingOrg = (event, connection) => {
    this.setState({ connectionInProcess: true });

    var authContext = new AdalNode.AuthenticationContext(
      connection.authorizationUrl
    );

    if (connection.accessToken && connection.accessToken.refreshToken) {
      authContext.acquireTokenWithRefreshToken(
        connection.accessToken.refreshToken,
        connection.appId,
        null,
        connection.accessToken.resource,
        this.connectToExistingOrgCallback
      );
    } else {
      authContext.acquireTokenWithClientCredentials(
        connection.orgUrl,
        connection.appId,
        connection.clientSecret,
        this.connectToExistingOrgCallback
      );
    }
  };

  connectToExistingOrgCallback = async (error, token) => {
    let errorDetail = null;
    if (!error) {
      let connection = getConnection(token.resource);

      connection.accessToken = token;

      saveConnection(connection);

      let orgName = connection.name;

      this.props.onTokenGenerated(token);

      await this.setUserInfo(token, orgName);

      this.props.history.push("/home");
    } else {
      errorDetail = error && error.message ? error.message : error;
    }

    this.setState({ connectionInProcess: false, connectionError: errorDetail });
  };

  render() {

    console.log("rendering auth");
    const connections = [...this.state.connections];

    let connectionInEditMode = { ...this.state.connectionInEditMode };
    if (
      connectionInEditMode != null &&
      connectionInEditMode.hasOwnProperty("name")
    ) {
      let nameConfig = {
        type: "text"
      };

      return (
        <div className="conn-select-box">
          <div className="conn-select-box-item">
            <Input
              elementType="input"
              elementConfig={nameConfig}
              size="is-small"
              changed={ev => this.onConnectionNameUpdated(ev)}
              value={connectionInEditMode.name}
              label="Name"
            />
          </div>

          <div className="buttons is-right">
            <AnchorButton
              clicked={event => this.onUpdateExistingConnection(event)}
              label="Update"
            />

            <AnchorButton
              clicked={event => this.onEditConnectionCancel(event)}
              label="Cancel"
            />
          </div>
        </div>
      );
    }


    let connectionErrorDetail = null;
    if (this.state.connectionError) {
      connectionErrorDetail = (
        <ErrorMessage message={this.state.connectionError} />
      );
    }

    let connectionInProcessBar =  (
        <progress className="progress is-small is-info" 
        style={{ height: '3px' ,visibility: this.state.connectionInProcess? 'visible': 'hidden'}}
         max="100"></progress>
      );
    

    if (connections.length > 0 && !this.state.showNewConnectionUI) {
      const envActions = [
        { id: "edit", label: "Edit" },
        { id: "remove", label: "Remove" }
      ];



      return (
        <div className="conn-select-box">
          <div className="conn-select-box-cont">
            {connectionErrorDetail}
            {connectionInProcessBar}
            <div className="conn-select-box-item">
              <h4 className="title is-4">Pick an Organization</h4>
              <div className="orgs-cont">
              {connections.map(connection => (
                <div key={connection.orgUrl} className="env-cont">
                  <div
                    className="env-detail"
                    onClick={event =>
                      this.connectToExistingOrg(event, connection)
                    }
                  >
                    <span className="org-name">{connection.name}</span>
                    <span className="org-url">{connection.orgUrl}</span>
                  </div>
                  <div className="env-actions">
                    <MoreButton
                      clicked={this.onEnvActionClick}
                      actions={envActions}
                      contextObj={connection}
                    />
                  </div>
                </div>
              ))}
              </div>
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
          {connectionErrorDetail}
          {connectionInProcessBar}
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

    return <React.Fragment>{newOrg}</React.Fragment>
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
    onuserUpdated: user =>
      dispatch({ type: actionTypes.SET_CURRENT_USER, userInfo: user })
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth);
