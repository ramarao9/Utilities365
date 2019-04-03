import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isValidToken } from '../../helpers/crmutil';
import AnchorButton from '../../components/UI/AnchorButton/AnchorButton';
import AdalNode from 'adal-node';
import Input from '../../components/UI/Input/Input';
import Crypto from 'crypto'

import { saveConnection ,getConnections} from '../../services/LocalStorageService';
import * as actionTypes from '../../store/actions';
import * as crmUtil from '../../helpers/crmutil';
import './Auth.css';
const isDev = window.require('electron-is-dev');
const { BrowserWindow } = window.require('electron').remote;

//{ orgName: "ramamarch", orgUrl: "https://ramamarch2019.onmicrosoft.com" },
//{ orgName: "ramafeb", orgUrl: "https://ramafeb2019.onmicrosoft.com" }

class Auth extends Component {

    state = {
        currentEnv: {},
        connections: getConnections(),
        newOrgConnection: {
            name:
            {
                label: "Name",
                elementType: "input",
                elementConfig: {
                    type: "text",
                    placeholder: "Name for the Dynamics 365 Connection."
                },
                value: ""
            },
            orgUrl:
            {
                label: "Org URL",
                elementType: "input",
                elementConfig: {
                    type: "text",
                    placeholder: "Provide the url of the org"
                },
                value: ""
            },

            applicationId:
            {
                label: "Azure AD Application Id",
                elementType: "input",
                elementConfig: {
                    type: "text",
                    placeholder: "Provide the Azure AD Application Id"
                },
                value: ""
            },
            replyUrl:
            {
                label: "Reply URL",
                elementType: "input",
                elementConfig: {
                    type: "text",
                    placeholder: "Provide the reply url from the app registration"
                },
                value: ""
            },
            authorizationEndpointUrl:
            {
                label: "OAuth Authorization URL",
                elementType: "input",
                elementConfig: {
                    type: "text",
                    placeholder: "Provide the OAuth 2.0 Authorization Endpoint"
                },
                value: ""
            },

            useClientSecret:
            {
                label: "Use Client Secret",
                elementType: "inputChk",
                elementConfig: {
                    type: "checkbox"
                },
                checked: false
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
        }
        else {
            updatedEl.value = event.target.value;
        }


        updatedNewConnectionInfo[inputIdentifier] = updatedEl;

        this.setState({ newOrgConnection: updatedNewConnectionInfo });


    }

    connectClick = (event) => {

        const connectionInfo = this.getNewConnectionInfo();
        //To do validation


        var authorizationUrl = this.getAuthorizationUrl(connectionInfo);
        this.requestAccessToken(authorizationUrl);


    }

    getAuthorizationUrl = (connectionInfo) => {

        var state = this.getStateForOAuth();

        var authorizationUrl = connectionInfo.authorizationUrl + "?response_type=code&client_id=" + connectionInfo.appId +
            "&redirect_uri=" + connectionInfo.replyUrl + "&state=" + state + "&resource=" + connectionInfo.orgUrl;
        return authorizationUrl;
    }

    getNewConnectionInfo = () => {

        const newConnectionInfo = {
            ...this.state.newOrgConnection
        };
        const orgUrl = newConnectionInfo.orgUrl.value;
        const appId = newConnectionInfo.applicationId.value;
        const replyUrl = newConnectionInfo.replyUrl.value;
        const authorizationUrl = newConnectionInfo.authorizationEndpointUrl.value;
        const saveConnection = newConnectionInfo.saveNewConnection.checked;

        const connectionInfo = {
            orgUrl: orgUrl,
            appId: appId,
            replyUrl: replyUrl,
            authorizationUrl: authorizationUrl,
            saveConnection: saveConnection
        }

        return connectionInfo;
    }

    loginToDynamics365 = (event) => {
        if (isDev) {
            let tokenObj = this.getDevToken();
            this.props.onTokenGenerated(tokenObj);
        }
        else {
            this.requestAccessToken();
        }

    }


    requestAccessToken = (authorizationUrl) => {


        let authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,

        });




        authWindow.loadURL(authorizationUrl);
        authWindow.show();


        authWindow.webContents.on('will-redirect', (event, newUrl) => {
            this.onNavigateToAAD(newUrl, authWindow);
        });


        authWindow.on('closed', () => {
            authWindow = null;
        });
    }

    onNavigateToAAD = (newUrl, authWndw) => {
        const connectionInfo = this.getNewConnectionInfo();


        var queryParams = newUrl.substr(newUrl.indexOf("?"));
        var urlParams = new URLSearchParams(queryParams);

        var code = urlParams.get("code");


        if (code == null || code === "")
            return;

        var authContext = new AdalNode.AuthenticationContext(connectionInfo.authorizationUrl);
        authContext.acquireTokenWithAuthorizationCode(code, connectionInfo.replyUrl, connectionInfo.orgUrl, connectionInfo.appId, null, this.adalCallback);

        if (authWndw)
            authWndw.destroy();
    }

    getStateForOAuth = () => {
        var stateOAuth = Crypto.randomBytes(64).toString('hex');
        return stateOAuth;
    }

    adalCallback = (error, tokenObj) => {


        if (isDev) {//Limitation due to cors issue when running locally
            tokenObj = this.getDevToken();
        }
        let connectionInfo = this.getNewConnectionInfo();
        if (tokenObj != null && connectionInfo.saveConnection) {
            this.props.onTokenGenerated(tokenObj);
            delete connectionInfo.saveConnection;
            connectionInfo["accessToken"] = tokenObj;
            saveConnection(connectionInfo);
        }
        else {
            let errMsg = 'Error occured while retrieving the Token: ' + error.message + '\n';
            alert(errMsg);
        }
    }




    getDevToken = () => {
        let token = {
            "tokenType": "Bearer",
            "scope": "user_impersonation",
            "expiresIn": "3599",
            "extExpiresIn": "3599",
            "expiresOn": "1553995890",
            "notBefore": "1553991990",
            "resource": "https://ramamarch2019.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik4tbEMwbi05REFMcXdodUhZbkhRNjNHZUNYYyIsImtpZCI6Ik4tbEMwbi05REFMcXdodUhZbkhRNjNHZUNYYyJ9.eyJhdWQiOiJodHRwczovL3JhbWFtYXJjaDIwMTkuY3JtLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83NDEwNjcxMi01Y2FiLTRjZTMtYTFjNi1lZDI5NDRkMjg2MjYvIiwiaWF0IjoxNTUzOTkxOTkwLCJuYmYiOjE1NTM5OTE5OTAsImV4cCI6MTU1Mzk5NTg5MCwiYWNyIjoiMSIsImFpbyI6IjQySmdZTGkyYVVGSy8rZVFoSTVrSThsa3dZaWFTdDM5UnJVQmJkeUxsNjF1V1BrbUtBc0EiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiYTc3YjU0MmYtMWNiOC00NjA2LWI3YzItMzgxODE5N2Y1MzU4IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJLb25lcnUiLCJnaXZlbl9uYW1lIjoiUmFtYSIsImlwYWRkciI6IjczLjE4NS4xMzkuNTIiLCJuYW1lIjoiUmFtYSBLb25lcnUiLCJvaWQiOiIwODQ3YzM4MC03YmViLTQxOGUtYTFhMy04N2UwYjNjMWQ2MDUiLCJwdWlkIjoiMTAwMzIwMDA0MDA0QjlEMSIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6InJmS2JBNWJqd3FjcHBvZGI4ZlFtOW40VXpNQXExXzdIcDdhMGJaYk9SUFUiLCJ0aWQiOiI3NDEwNjcxMi01Y2FiLTRjZTMtYTFjNi1lZDI5NDRkMjg2MjYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYW1hcmNoMjAxOS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFtYXJjaDIwMTkub25taWNyb3NvZnQuY29tIiwidXRpIjoiZ3hOYnFmeGNmVUMyRjJTVXhmQXBBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.PNbh22RJajHNfI5DaELx5MIETrFX2wzUOvxD_a0z_10_f-sgzuNFWurZmaA37exVjaMaQwyAmpYybGVTcCA7q4pcWRodFscW-1uhlqdns4ovpYXrrC6vkQDAet3hrPb2DLQ3Hz21FpPO3zDPOHFXVJBv8o9IEspZ7YKDMBdSnJhwWIwqXjC6PFnRFdsdbq9G6glo5IuU6E6q7zZG5973NfeokHlDGBzrunKXznSwcncrXaq416-uP9JMvu03ZVCsMGwy84TmiHBam8NRitJCpwoXPy6tLFcW8KxvUFXWjnH8SJjSy_dJUOKVumGnkea5Q-U1HjiqX_XvsklP4OzNtQ",
            "refreshToken": "AQABAAAAAACEfexXxjamQb3OeGQ4GugvBileNs6onfmFr7WN1hAOS0D6awbieEVu14oEBLHJrfvUgTsL2AEJtgVoPNqRtAKkHaTpk-hWAlj1pXHxxlSMhdUw702Z6u-_5yAra7Jfr9lxdc7y8799a2SjugtJiQTrHKGstZapMy_7fu2834c_KERzxWVOR4qbVubiDd0e4S8W-JaBcxeFg73URwWnuq4bDBFvSXuzi6vTuraVJlSh5R2fkxnyw83NYBwDSqITSzfQEBF-RzcJuln0TEqwDkNJi5DwnQz20qXb8zv4zBUU8lZWQyZXDFR393DFTsTyZu7v8j28M1oKkWkmi-b2M-uTGSRlTRd0f1xXJuUFhT3CNPOmVoR9AuE_9hOfnc0OXgzZkVv9kOfeEqySSU5bkgajXGEz9_X0CTI9wlupRUlsi42VjlQvM-JSOjUx5IEOaTDhTwiDSyWbr3RPJXKwRhZkCgGyMahyPby44qmHULM1S9gTLz8OV-6dMmkzNYXvNj2-Pku_qj-zLKi5D15XeTYqOsOAwnNY3wg8i94-SLgdsIZVZHO83AswsmVJ-8BGBK2GMHnoMQemVnkfRO-UL2otK3RkrtyAh7s42VBIOaGU9M7QKSNz1sCfXka52SzHqZuL36zwk5pcQbwUJTi9QYAMPAcMpdQ-EAxIY7fTfGzHkGtJftC1eJxVwzsU5gkfe5dR-eS1St7BkhqWFVS6myOxUZejm3c9Q45T5KqqmcfjOwRznzlac0BivVOMadlayjgazOBUSOTLILMM-brswz31tRsbg0yDbv4icr5jdStYoCAA",
            "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJhNzdiNTQyZi0xY2I4LTQ2MDYtYjdjMi0zODE4MTk3ZjUzNTgiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83NDEwNjcxMi01Y2FiLTRjZTMtYTFjNi1lZDI5NDRkMjg2MjYvIiwiaWF0IjoxNTUzOTkxOTkwLCJuYmYiOjE1NTM5OTE5OTAsImV4cCI6MTU1Mzk5NTg5MCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6IjA4NDdjMzgwLTdiZWItNDE4ZS1hMWEzLTg3ZTBiM2MxZDYwNSIsInN1YiI6Ik8ydlJNc19OX0VoOVBEN2FaSGdRT1YwX0k3YlRfRURpeUZKZXVIZ01pcjAiLCJ0aWQiOiI3NDEwNjcxMi01Y2FiLTRjZTMtYTFjNi1lZDI5NDRkMjg2MjYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYW1hcmNoMjAxOS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFtYXJjaDIwMTkub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
        };


        return token;
    }


    connectToExistingOrg = (event,connection) => {


        const s = 100;

    }



    render() {

        if (isValidToken(this.props.tokenData)) {
            return <Redirect to='/' />
        }



        const connections = [...this.state.connections];

        if (connections.length > 0) {

            return (
                <div className="org-select-box">
                    <div className="org-select-box-item" >

                        <h4 class="title is-4">Pick an Organization</h4>
                        {connections.map(connection => (
                            <div className="env-cont" onClick={(event) => this.connectToExistingOrg(event,connection)}>
                                <div className="env-detail">
                                    <span class="org-name">{connection.name}</span>
                                    <span class="org-url">{connection.orgUrl}</span>
                                </div>
                                <div className="env-actions">
                                    <span class="icon">
                                        <FontAwesomeIcon icon="pencil-alt" />
                                    </span>

                                    <span class="icon">
                                        <FontAwesomeIcon icon="trash-alt" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="new-org-cont">
                        <div>
                            <a class="button is-small">
                                <span class="icon is-small">
                                    <FontAwesomeIcon icon="plus" />
                                </span>
                                <span>New</span>
                            </a>
                        </div>
                    </div>
                </div>
            );

        }


        const newConnectionElements = [];

        for (let key in this.state.newOrgConnection) {
            newConnectionElements.push(
                {
                    id: key,
                    config: this.state.newOrgConnection[key]
                }
            )
        }

        let newOrg = (
            <div>

                {newConnectionElements.map(connectionEle => (

                    <Input
                        key={connectionEle.id}
                        elementType={connectionEle.config.elementType}
                        elementConfig={connectionEle.config.elementConfig}
                        size="is-small"
                        value={connectionEle.config.value}
                        checked={connectionEle.config.checked}
                        clicked={(event) => this.newConnectionEleChangedHandler(event, connectionEle.id)}
                        changed={(event) => this.newConnectionEleChangedHandler(event, connectionEle.id)}
                        label={connectionEle.config.label} />
                ))}


                <AnchorButton
                    clicked={(event) => this.connectClick(event)}
                    label="Connect" />


            </div>
        );


        return (

            <div>
                {newOrg}

                {/* <Button btnType="Login"
                clicked={this.loginToDynamics365}>Login</Button> */}
            </div>


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
        onTokenGenerated: (token) => dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: token })
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

