import React, { FunctionComponent, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { connect } from "react-redux";
import ErrorMessage from "../../components/UI/ErrorMessage/ErrorMessage";
import MoreButton from "../../components/UI/MoreButton/MoreButton";
import { isValidToken } from "../../helpers/crmutil";
import AnchorButton from "../../components/UI/AnchorButton/AnchorButton";
import * as MsalNode from "@azure/msal-node";


import Input from "../../components/UI/Input/Input";
import Crypto from "crypto";
import axios from "axios";
import {
  saveConnection,
  getConnections,
  getConnection,
  removeConnection
} from "../../services/LocalStorageService";
import AuthProvider from "../../helpers/Auth/AuthHelper";
import store from "../../store/store";
import { retrieveAll } from "../../helpers/webAPIClientHelper";
import * as actionTypes from "../../store/actions";
import "./Auth.css";
import isEmpty from "is-empty";
import { Connection, ConnectionElement, ConnectionUI } from "../../interfaces/Auth/Connection";
import { AuthConnection } from "../../interfaces/Auth/AuthConnection";
import { AuthenticationResult, AuthorizationUrlRequest } from "@azure/msal-node";
// import { getAccount, getAuthorizationUrlFromOrgUrl, getMSALConfidentialClient, getMSALPublicClient, getToken, getTokenByClientCredentials } from "../../helpers/Auth/AuthHelper";
import { StoreState } from "../../interfaces/Store/StoreState";
const isDev = window.require("electron-is-dev");
const { BrowserWindow } = window.require("electron").remote;






const MSFT_APP_ID = "51f81489-12ee-4a9e-aaae-a2591f45987d";
const MSFT_REPLY_URL = "app://58145B91-0C36-4500-8554-080854F2AC97";


export const Auth: React.FC = () => {


  const getNewOrgConnection = (): ConnectionUI => {
    let newOrgConnection: ConnectionUI = {
      name: {
        label: "Name",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Name for the Dynamics 365 Connection."
        },
        isHidden: false,
        value: ""
      },
      orgUrl: {
        label: "Org URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the url of the org"
        },
        isHidden: false,
        value: ""
      },
      authType: {
        label: "Auth Type",
        elementType: "radio",
        elementConfig: {
          type: "radio",
          name: "authType",
          options: ["Authorizaton Code(User Credentials)", "Client Credentials"]
        },
        isHidden: false,
        value: ""
      },
      useMSFTApp: {
        label: "Use Microsoft Azure AD App",
        elementType: "inputChk",
        elementConfig: {
          type: "checkbox"
        },
        isHidden: true,
        checked: false
      },

      applicationId: {
        label: "Azure AD Application Id",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder:
            "Provide the Azure AD Application Id e.g. 00000000-0000-0000-0000-000000000000"
        },
        isHidden: true,
        value: ""
      },
      replyUrl: {
        label: "Reply URL",
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Provide the reply url from the app registration if you want to use authorization code authentication"
        },
        isHidden: true,
        value: ""
      },
      clientSecret: {
        label: "Client Secret",
        elementType: "input",
        elementConfig: {
          type: "password",
          placeholder: "Provide the client secret if you want to use client credential grant or S2S authentication"
        },
        isHidden: true,
        value: ""
      },
      saveNewConnection: {
        label: "Save Connection Locally(Access Token/Client Secret)",
        elementType: "inputChk",
        elementConfig: {
          type: "checkbox"
        },
        isHidden: false,
        checked: false
      }

    }

    return newOrgConnection;
  }

  const [connectionError, setConnectionError] = useState<string | undefined | null>("");
  const [connectionInEditMode, setConnectionInEditMode] = useState<AuthConnection | null>();
  const [connectionInProcess, setConnectionInProcess] = useState<boolean>(false);
  const [showNewConnectionUI, setShowNewConnectionUI] = useState<boolean>(false);
  const [newOrgConnection, setNewOrgConnection] = useState<ConnectionUI>(getNewOrgConnection());
  const [connections, setConnections] = useState<Array<AuthConnection>>(getConnections());

  const dispatch = useDispatch()
  const history = useHistory();


  const newConnectionEleChangedHandler = (event: any, inputIdentifier: string) => {
    const updatedNewConnectionInfo: ConnectionUI = {
      ...newOrgConnection
    };



    const updatedEl: ConnectionElement = {
      ...updatedNewConnectionInfo[`${inputIdentifier}`]
    };

    if (updatedEl.elementType === "inputChk") {
      updatedEl.checked = !updatedEl.checked;
    } else {
      updatedEl.value = event.target.value;
    }

    const msftAppEl = {
      ...updatedNewConnectionInfo["useMSFTApp"]
    };
    const applicationIdEl = {
      ...updatedNewConnectionInfo["applicationId"]
    };

    const replyUrlEl = {
      ...updatedNewConnectionInfo["replyUrl"]
    };

    const clientSecretEl = {
      ...updatedNewConnectionInfo["clientSecret"]
    };

    var elVal = updatedEl.value;

    if (inputIdentifier === "authType") {
      var useClientCredentials = (elVal === "Client Credentials");
      applicationIdEl.isHidden = false;
      msftAppEl.checked = useClientCredentials;
      msftAppEl.isHidden = useClientCredentials;
      replyUrlEl.isHidden = useClientCredentials;
      clientSecretEl.isHidden = useClientCredentials === false;

      if (useClientCredentials) {
        applicationIdEl.value = "";
        replyUrlEl.value = "";
      }
    }

    if (inputIdentifier === "useMSFTApp") {
      if (updatedEl.checked) {//when Use MSFT App is true
        applicationIdEl.value = MSFT_APP_ID;
        replyUrlEl.value = MSFT_REPLY_URL;
      }
      else {
        applicationIdEl.value = "";
        replyUrlEl.value = "";
      }
    }


    updatedNewConnectionInfo["useMSFTApp"] = msftAppEl;
    updatedNewConnectionInfo["replyUrl"] = replyUrlEl;
    updatedNewConnectionInfo["applicationId"] = applicationIdEl;
    updatedNewConnectionInfo["clientSecret"] = clientSecretEl;
    updatedNewConnectionInfo[inputIdentifier] = updatedEl;

    setNewOrgConnection(updatedNewConnectionInfo);
  };

  const onNewConnectionClick = (event: any) => {
    showOrHideNewConnectionUI(true);
  };

  const connectClick = async (event: any) => {


    const connectionInfo = await getNewConnectionInfo();
    await connectToOrg(connectionInfo);


  };

  const connectToOrg = async (connectionInfo: AuthConnection) => {

    setConnectionInProcess(true);

    try {


      let authProvider: AuthProvider = getAuthProviderFromStore();
      let token = await authProvider.getToken(connectionInfo);
      setConnectionInProcess(false);
      if (token == null) {
        setConnectionError("An error occurred while retrieving the token. Please try again.");
      }
      else {
        await navigateToHome(token, connectionInfo);
      }
    }
    catch (ex) {
      setConnectionInProcess(false);
    }
  }

  const connectToExistingOrg = async (event: any, connectionInfo: AuthConnection) => {
    await connectToOrg(connectionInfo);
  };




  const getNewConnectionInfo = async () => {
    const newConnectionInfo = {
      ...newOrgConnection
    };
    const connName: string = newConnectionInfo.name.value!!;
    const orgUrl: string = newConnectionInfo.orgUrl.value!!;
    const authType: string = newConnectionInfo.authType.value!!;
    const appId: string = newConnectionInfo.applicationId.value!!;
    const replyUrl = newConnectionInfo.replyUrl.value;
    const clientSecret = newConnectionInfo.clientSecret.value;
    const saveConnection = newConnectionInfo.saveNewConnection.checked;


    const scope = orgUrl && orgUrl.endsWith("/") ? `${orgUrl.slice(0, -1)}/.default` : `${orgUrl}/.default`;

    const useMSFTApp = newConnectionInfo.useMSFTApp.value === "true";

    const authorizationUrl: string = await getAuthorizationUrlFromOrgUrl(orgUrl);
    const authorityUrl = authorizationUrl.replace("oauth2/authorize", "");

    const connectionInfo: AuthConnection = {
      name: connName,
      orgUrl: orgUrl,
      authType: authType,
      appId: appId,
      replyUrl: replyUrl,
      clientSecret: clientSecret,
      useTokenCache: saveConnection,
      scope: scope,
      authority: authorityUrl,
      isMSFTApp: useMSFTApp,
      authorizationUrl: authorizationUrl
    };

    return connectionInfo;
  };


  const getAuthorizationUrlFromOrgUrl = async (orgUrl: any) => {
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
        authorizationUrl = getAuthorizationUrlFromAuthenticateHeader(
          authenticateHeader
        );
      }
    }

    return authorizationUrl;
  };


  const getAuthorizationUrlFromAuthenticateHeader = (authenticateHeader: any) => {
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

  const onTokenGenerated = (tokenObj: any) => {
    dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: tokenObj });
  }

  const onConnectionSet = (connection: any) => {
    dispatch({ type: actionTypes.SET_CURRENT_CONNECTION, currentConnection: connection });
  }




  const navigateToHome = async (tokenObj: AuthenticationResult, connectionInfo: AuthConnection) => {

    onTokenGenerated(tokenObj);



    if (tokenObj.account && tokenObj.account.homeAccountId) {
      connectionInfo.account = tokenObj.account;
      connectionInfo.accountId = tokenObj.account.homeAccountId;
    }

    onConnectionSet(connectionInfo);

    if (connectionInfo.useTokenCache) {
      saveConnection(connectionInfo);
    }

    await setUserInfo(tokenObj, connectionInfo);

    history.push("/home");
  }




  const setUserInfo = async (token: AuthenticationResult, connectionInfo: AuthConnection) => {

    let tokenAccount = token.account;
    let userId = tokenAccount ? tokenAccount.username : "";
    let userFullName = tokenAccount ? tokenAccount.name : "";


    if (userId === "") {
      let user: any = await getUser(connectionInfo.appId);
      userId = user["domainname"];
      userFullName = user["fullname"];
    }

    let currentUserInfo = {
      name: userFullName,
      orgName: getOrgNameFromUrl(connectionInfo.orgUrl),
      userId: userId
    };


    onuserUpdated(currentUserInfo);
  };

  const getOrgNameFromUrl = (orgUrl: string) => {


    if (!orgUrl)
      return orgUrl;

    return orgUrl.replace("https://", "").replace(".crm.dynamics.com", "").replace("/", "");
  }

  const getUser = async (applicationId: string) => {
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


  const onuserUpdated = (user: any) => {
    dispatch({ type: actionTypes.SET_CURRENT_USER, userInfo: user })
  }




  const cancelConnectionClick = (ev: any) => {
    setConnectionInProcess(false);
    setConnectionError(null);
    showOrHideNewConnectionUI(false);
  };

  const showOrHideNewConnectionUI = (show: boolean) => {

    setShowNewConnectionUI(show)
  };

  const onEnvActionClick = (event: any, action: any, connection: AuthConnection) => {
    switch (action.id) {
      case "edit":
        setConnectionInEditMode(connection)
        break;

      case "remove":
        deleteConnection(connection);
        break;

      default:
        break;
    }
  };

  const onConnectionNameUpdated = (ev: any) => {
    let updatedConnectionInEditMode: any = { ...connectionInEditMode };

    updatedConnectionInEditMode.name = ev.target.value;
    setConnectionInEditMode(updatedConnectionInEditMode);
  };

  const onUpdateExistingConnection = (ev: any) => {
    let updatedConnectionInEditMode = { ...connectionInEditMode } as AuthConnection;


    saveConnection(updatedConnectionInEditMode);

    let updatedConnections = [...connections];

    let connectionIndex = updatedConnections.findIndex(
      x => x.orgUrl === updatedConnectionInEditMode.orgUrl && x.appId === updatedConnectionInEditMode.appId
    );

    updatedConnections[connectionIndex] = updatedConnectionInEditMode;


    setConnections(updatedConnections);
    setConnectionInEditMode(null);
  };

  const onEditConnectionCancel = (event: any) => {
    setConnectionInEditMode(null);
  };

  const deleteConnection = (connection: AuthConnection) => {
    let updatedConnections = removeConnection(connection);
    onuserUpdated(null);
    setConnections(updatedConnections);
  };




  function getAuthProviderFromStore() {
    const currentState = store.getState();
    return currentState != null ? currentState.authProvider : null;
  }



  console.log("rendering auth");

  if (
    connectionInEditMode != null &&
    connectionInEditMode.hasOwnProperty("name")
  ) {
    let nameConfig = {
      type: "text"
    };

    return (
      <div className="conn-select-box" >
        <div className="conn-select-box-item" >
          <Input
            elementType="input"
            elementConfig={nameConfig}
            size="is-small"
            changed={(ev: any) => onConnectionNameUpdated(ev)}
            value={connectionInEditMode.name}
            label="Name"
          />
        </div>

        < div className="buttons is-right" >
          <AnchorButton
            clicked={(event: any) => onUpdateExistingConnection(event)}
            label="Update"
          />

          <AnchorButton
            clicked={(event: any) => onEditConnectionCancel(event)}
            label="Cancel"
          />
        </div>
      </div>
    );
  }


  let connectionErrorDetail = null;
  if (connectionError) {
    connectionErrorDetail = (
      <ErrorMessage message={connectionError} />
    );
  }

  let connectionInProcessBar = (
    <progress className="progress is-small is-info"
      style={{ height: '3px', visibility: connectionInProcess ? 'visible' : 'hidden' }
      }
      max="100" > </progress>
  );


  if (connections.length > 0 && !showNewConnectionUI) {
    const envActions = [
      { id: "edit", label: "Edit" },
      { id: "remove", label: "Remove" }
    ];



    return (<div className="conn-select-box">
      <div className="conn-select-box-cont">
        {connectionErrorDetail}
        {connectionInProcessBar}
        <div className="conn-select-box-item">
          <h4 className="title is-4" > Pick an Organization </h4>
          <div className="orgs-cont" >
            {
              connections.map(connection => (
                <div key={connection.orgUrl + "_" + connection.appId} className="env-cont">
                  <div
                    className="env-detail"
                    onClick={
                      event =>
                        connectToExistingOrg(event, connection)
                    }
                  >
                    <span className="org-name" > {connection.name} </span>
                    < span className="org-url" > {connection.orgUrl} </span>
                  </div>
                  < div className="env-actions" >
                    <MoreButton
                      clicked={onEnvActionClick}
                      actions={envActions}
                      contextObj={connection}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="new-org-cont" >
          <div>
            <AnchorButton
              iconName="plus"
              classes={["is-small"]}
              clicked={(event: any) => onNewConnectionClick(event)}
              label="New"
            />
          </div>
        </div>
      </div>
    </div>
    );
  }

  const newConnectionElements = [];

  for (let key in newOrgConnection) {
    newConnectionElements.push({
      id: key,
      config: newOrgConnection[key]
    });
  }

  let newOrg = (
    <div className="conn-select-box" >
      <div className="conn-select-box-item" >
        {connectionErrorDetail}
        {connectionInProcessBar}
        {
          newConnectionElements.map(connectionEle => (
            <Input
              key={connectionEle.id}
              elementType={connectionEle.config.elementType}
              elementConfig={connectionEle.config.elementConfig}
              size="is-small"
              labelStyle="auth-label"
              isHidden={connectionEle.config.isHidden}
              value={connectionEle.config.value}
              checked={connectionEle.config.checked}
              clicked={
                (event: any) =>
                  newConnectionEleChangedHandler(event, connectionEle.id)
              }
              changed={
                (event: any) =>
                  newConnectionEleChangedHandler(event, connectionEle.id)
              }
              label={connectionEle.config.label}
            />
          ))
        }
      </div>

      < div className="buttons is-right" >
        <AnchorButton
          clicked={(event: any) => connectClick(event)}
          label="Connect"
        />

        <AnchorButton
          clicked={(event: any) => cancelConnectionClick(event)}
          label="Cancel"
        />
      </div>
    </div>
  );

  return <React.Fragment>{newOrg}</React.Fragment>
}



