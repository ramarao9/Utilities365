import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isValidToken } from '../../helpers/crmutil';
import Button from '../../components/UI/Button/Button';
import AdalNode from 'adal-node';
import DynamicsWebApi from 'dynamics-web-api';
import Crypto from 'crypto'
import * as actionTypes from '../../store/actions';
import * as crmUtil from '../../helpers/crmutil';
import './Auth.css';
const isDev = window.require('electron-is-dev');
const { BrowserWindow } = window.require('electron').remote;



class Auth extends Component {

    state = {
        currentEnv: {},
        environments: [{ orgName: "ramamarch", orgUrl: "https://ramamarch2019.onmicrosoft.com" },
        { orgName: "ramafeb", orgUrl: "https://ramafeb2019.onmicrosoft.com" }]
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


    getAuthorizationEndpointUrl = () => {




        //await axios.get("")

    }


    requestAccessToken = () => {


        let authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,

        });



        var authorizationUrl = this.getAuthorizationUrl();
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
        var authUrl = crmUtil.getAuthorityUri();
        var resource = crmUtil.getOrgUrl();
        var clientId = crmUtil.getClientId();
        var queryParams = newUrl.substr(newUrl.indexOf("?"));
        var urlParams = new URLSearchParams(queryParams);

        var code = urlParams.get("code");


        if (code == null || code === "")
            return;

        var authContext = new AdalNode.AuthenticationContext(authUrl);
        authContext.acquireTokenWithAuthorizationCode(code, crmUtil.getRedirectUri(), resource, clientId, null, this.adalCallback);

        if (authWndw)
            authWndw.destroy();
    }

    getStateForOAuth = () => {
        var stateOAuth = Crypto.randomBytes(64).toString('hex');
        return stateOAuth;
    }

    adalCallback = (error, tokenObj) => {

        if (tokenObj != null) {
            //tokenObj.willExpireOn = this.getWillExpireOn(tokenObj.expiresIn);
            this.props.onTokenGenerated(tokenObj);


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
            "expires_in": "3600",
            "ext_expires_in": "3600",
            "expiresOn": "1552172320",
            "not_before": "1552168420",
            "resource": "https://ramafebruary2019.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik4tbEMwbi05REFMcXdodUhZbkhRNjNHZUNYYyIsImtpZCI6Ik4tbEMwbi05REFMcXdodUhZbkhRNjNHZUNYYyJ9.eyJhdWQiOiJodHRwczovL3JhbWFmZWJydWFyeTIwMTkuY3JtLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMvIiwiaWF0IjoxNTUyMTY4NDIwLCJuYmYiOjE1NTIxNjg0MjAsImV4cCI6MTU1MjE3MjMyMCwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhLQUFBQXBxT24rNUJqNmNWZXB6V1JPdFUyL2lxQmJqSHU0NGtlSmVFVThUNW1iVW89IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6Ijk0MTUwMWI2LTRiZjAtNGYzZS1iNmVkLTY1OGMwYTU2MGE4YyIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS29uZXJ1IiwiZ2l2ZW5fbmFtZSI6IlJhbWEiLCJpcGFkZHIiOiI3My4xODUuMTM5LjUyIiwibmFtZSI6IlJhbWEgS29uZXJ1Iiwib2lkIjoiYTgyOTA0MzQtOWJkNi00MDNkLTlmM2YtNTU4NzA0MGFhNTVhIiwicHVpZCI6IjEwMDMyMDAwM0JCREMwQjMiLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJJekw5NlQ0QWZCRmo2SkZmaE94cUo1MzNKcC1RcWhpNmtTRU8wTC1lQ3BrIiwidGlkIjoiYTYwZjhhNmMtNGVmZC00ZTE4LThkYzgtNjk4MTk1ZjUwM2UzIiwidW5pcXVlX25hbWUiOiJyYW1hQHJhbWFmZWJydWFyeTIwMTkub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hZmVicnVhcnkyMDE5Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6Ik9zQVlZZ2ZXVkVDZFluOTNqREFxQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCJdfQ.ExK01_Tcfyf3c3GV9PKXv-MnV3YSausF6N0W3eGiAoj46MvD960KUbP3mKjabqpzQiGTbJZoO4anMbYVU_jblM8Kp_XDm5BiuNA1xYi8q6cdGyLlGYSOk3Dn0Z89khyXKvoI133RdU2UjXWOUeTKQyGhm73JWsWvkLY57AHq25QSBbKcbzlPpDCeen7B3E7dhbSx9xV3XcFF07V4bDVaBkAH2LHLgml4QAiFsu4EgGh6OB7NcPHgSQNM0cxjELJcbAl-R1BG6dEZlLQERLCyHrwT8NHFrrgrjmVTrmTUJ0Meu121YUJXTLLfFlC3GpExkcSq1tdbB3eYrSbiKN7N8w",
            "refreshToken": "AQABAAAAAACEfexXxjamQb3OeGQ4GugvJX3wP8nUxPbrZJ1e3OAtESQNQSWDHBWU7Es5q8uLMu8i704hy6S3kF_q1_rSlVK09cgSewMlSnFVe-Z6bcqO9L8gN2mo9sJlknY8Sqg__-tAfiGRHAAp1mvId3YByl_dpbz3TOAp084UAcszkgsCtdCsR4AF6GtmlYvIB8IWRYGe8TDCcLLyQwJHa172GyHqL2AAEvj-3g84lochMOgIqVjmbiRLVGRutcUla9gJe4AioGcbk1cq_gryJByfMzKf0w2A7Gqc1RCUnYAj17tAEPrpLk6MazUOOeJy1VvwlF-ifkQAi8Kt-Sd3z_FbhnLrhFdakZ93df29R30FTrU7BYyUgqmpJF9tzfCdR6KEheSpzeWky4trDkazkreh3fyEeMZcqm9UpBqxc_g4x8yNA2iO86LZUxTVeYeLqHiB7tQ9FNQMHo5gMH6egcVaD1Gy4znGkGLL6RdLFiExH2_oex0mPv5HVM5dszqh0pRahoZe4VosNeSmO8JONWX-Clxwk0keMIHj3qdIKtYMeTz8xagNSXqY3YI6iEsDL7ARgcGQN7wBI-YkFfggzi3G3pKZ0Bi6bim8L1q4Qex1SzS_bagqIPPPrCBaoCsh8Axm_vCBjdez6ExwS_6-t_YkppoH2F_vPUxfwplLPFecf-Ch7VpBd_PP2gWR7FYuI56RiGa2mfCtrkCQf88kv1OwHgjUWTqrBfjPfb3W7tQ1_CO3MGg_MhDO6GIs8zSwV7R0WRlgURN8l7jFmOiB1aBIcQco_M9nYyJnNaSVHzLo-Wae37JA89nv9nk6GPwhDzBnSlwgAA",
            "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI5NDE1MDFiNi00YmYwLTRmM2UtYjZlZC02NThjMGE1NjBhOGMiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMvIiwiaWF0IjoxNTUyMTY4NDIwLCJuYmYiOjE1NTIxNjg0MjAsImV4cCI6MTU1MjE3MjMyMCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImE4MjkwNDM0LTliZDYtNDAzZC05ZjNmLTU1ODcwNDBhYTU1YSIsInN1YiI6InNkOFVUOVFqZkVxejhrVXNBUkZKWi1FT3d3cVNQQ3F1R012bDlodzhHa1EiLCJ0aWQiOiJhNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWZlYnJ1YXJ5MjAxOS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFmZWJydWFyeTIwMTkub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
        };


        return token;
    }
    getAuthorizationUrl = () => {
        var authUrl = crmUtil.getAuthorityUri();
        var resource = crmUtil.getOrgUrl();
        var clientId = crmUtil.getClientId();
        var redirectUri = crmUtil.getRedirectUri();
        var state = this.getStateForOAuth();

        var authorizationUrl = authUrl + "?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&state=" + state + "&resource=" + resource;
        return authorizationUrl;
    }



    render() {

        if (isValidToken(this.props.tokenData)) {
            return <Redirect to='/' />
        }



        const envs = [...this.state.environments];

        if (envs.length > 0) {

            return (

                <div className="org-select-box">
                    <div className="org-select-box-item" >

                        <h4 class="title is-4">Pick an Organization</h4>
                        {envs.map(environ => (
                            <div className="env-cont">
                                <div className="env-detail">
                                    <span class="org-name">{environ.orgName}</span>
                                    <span class="org-url">{environ.orgUrl}</span>
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

        return (
            <div>

                <Button btnType="Login"
                    clicked={this.loginToDynamics365}>Login</Button>
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

