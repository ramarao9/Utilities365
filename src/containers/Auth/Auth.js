import React, { Component } from "react";
import { Redirect } from "react-router";
import { connect } from "react-redux";
import MoreButton from "../../components/UI/MoreButton/MoreButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import * as crmUtil from "../../helpers/crmutil";
import "./Auth.css";
const isDev = window.require("electron-is-dev");
const { BrowserWindow } = window.require("electron").remote;

class Auth extends Component {
  state = {
    currentEnv: {},
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
          placeholder: "Provide the reply url from the app registration"
        },
        value: ""
      },
      clientSecret: {
        label: "Client Secret",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the secret for client credential grant or S2S"
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

  connectClick = async event => {
    const connectionInfo = this.getNewConnectionInfo();
    //To do validation

    let authorizationUrl = await this.getAuthorizationUrlFromOrgUrl(
      connectionInfo.orgUrl
    );
    connectionInfo.authorizationUrl = authorizationUrl;

    if (connectionInfo.clientSecret != null) {
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
      this.requestAccessToken(authorizationUrlWithParams);
    }
  };

  getAuthorizationUrlFromOrgUrl = async orgUrl => {
    let authorizationUrl = null;
    try {
      const response = await axios.get(`${orgUrl}/api/data`);
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

  requestAccessToken = authorizationUrl => {
    let authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false
    });

    if (isDev) {
      authWindow.webPreferences = { webSecurity: false };
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
    } else {
      let errMsg =
        "Error occured while retrieving the Token: " + error.message + "\n";
      alert(errMsg);
    }
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
      ["fullname","domainname"],
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
    var authContext = new AdalNode.AuthenticationContext(
      connection.authorizationUrl
    );

    if (connection.accessToken.refreshToken) {
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
    if (!error) {
      let connection = getConnection(token.resource);

      connection.accessToken = token;

      saveConnection(connection);

      let orgName = connection.name;

      this.props.onTokenGenerated(token);

      await this.setUserInfo(token, orgName);

      this.props.history.push("/");
    } else {
    }
  };

  render() {
    if (isValidToken(this.props.tokenData)) {
      return <Redirect to="/" />;
    }

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

    if (connections.length > 0 && !this.state.showNewConnectionUI) {
      const envActions = [
        { id: "edit", label: "Edit" },
        { id: "remove", label: "Remove" }
      ];

      return (
        <div className="conn-select-box">
          <div className="conn-select-box-cont">
            <div className="conn-select-box-item">
              <h4 className="title is-4">Pick an Organization</h4>
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

    return <div>{newOrg}</div>;
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
