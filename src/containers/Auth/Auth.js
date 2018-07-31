import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { isValidToken } from '../../helpers/crmutil';
import Button from '../../components/UI/Button/Button';
import AdalNode from 'adal-node';
import DynamicsWebApi from 'dynamics-web-api';
import Crypto from 'crypto'
import * as actionTypes from '../../store/actions';

const isDev = window.require('electron-is-dev');
const { BrowserWindow } = window.require('electron').remote;

class Auth extends Component {

    state = {

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

    getLeads = () => {

        var dynamicsWebApi = new DynamicsWebApi({
            webApiUrl: this.getResource() + "api/data/v9.0/"
        });

        var request = {
            collection: "leads",
            select: ["fullname", "subject"],
            filter: "statecode eq 0",
            maxPageSize: 5,
            count: true,
            token: this.getToken()
        };


        dynamicsWebApi.retrieveMultipleRequest(request).then(function (response) {


            var count = response.oDataCount;
            var nextLink = response.oDataNextLink;
            var records = response.value;

        })
            .catch(function (error) {
                //catch an error
            });
    }

    requestAccessToken = () => {
        var authUrl = this.getAuthorityUri();
        var resource = this.getResource();
        var clientId = this.getClientId();

        let authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        });

        var authorizationUrl = this.getAuthorizationUrl();
        authWindow.loadURL(authorizationUrl);
        authWindow.show();
        // 'will-navigate' is an event emitted when the window.location changes
        // newUrl should contain the tokens you need
        authWindow.webContents.on('will-navigate', (event, newUrl) => {
            this.onNavigateToAAD(newUrl, authWindow);
        })

        authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {

        });

        authWindow.on('closed', () => {
            authWindow = null;
        });
    }

    onNavigateToAAD = (newUrl, authWndw) => {
        var authUrl = this.getAuthorityUri();
        var resource = this.getResource();
        var clientId = this.getClientId();
        var queryParams = newUrl.substr(newUrl.indexOf("?"));
        var urlParams = new URLSearchParams(queryParams);

        var code = urlParams.get("code");


        if (code == null || code === "")
            return;

        var authContext = new AdalNode.AuthenticationContext(authUrl);
        authContext.acquireTokenWithAuthorizationCode(code, "https://google.com", resource, clientId, null, this.adalCallback);


        if (authWndw)
            authWndw.destroy();
    }

    getStateForOAuth = () => {
        var stateOAuth = Crypto.randomBytes(64).toString('hex');
        return stateOAuth;
    }

    adalCallback = (error, tokenObj) => {
        if (!error) {
            this.props.onTokenGenerated(tokenObj);
        }
        else {
            console.log('Token has not been retrieved. Error: ' + error.stack);
            this.props.onTokenGenerated(tokenObj)
        }
    }

    getDevToken = () => {
        return {
            "token_type": "Bearer",
            "scope": "user_impersonation",
            "expires_in": "3599",
            "ext_expires_in": "0",
            "expires_on": "1532581685",
            "not_before": "1532577785",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzI1Nzc3ODUsIm5iZiI6MTUzMjU3Nzc4NSwiZXhwIjoxNTMyNTgxNjg1LCJhY3IiOiIxIiwiYWlvIjoiNDJCZ1lOQTFGTTV3OGIxbWw5djM4R3RFMG5kSnhlZk0vSFUvWE44dDFKcVlMeDgvN3hFQSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoiaUVXeTZkU3BxVXF3b3R5aVVrMkdBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.sW8lqzx183z3iphd_cgAVwNxIRUEjT__RQ8gza79ytnIJffIsmE64a3s2BGJm5rUQQR1CcZEYAWoj2xf5p5Ut-z86bNk3GQWL6vXeNS8PoBDvuH_odiNGArLvJ1vpc70bOh_BTXnuU55y4CaZJ8lxIAk3PuobXfQp-DdQQk-NYzBMiyMZEDPJVm1TkTigjtuTedhxYXhH2BR9WHKABI6pCiecM_U7MJEPnV8Tau3PyAK8yyBJhR9uBHYx0PFkLMpTWR-3FzKO_0CgRDfSfpLRSbtvF-TSThIIl_PFPmD-1sBqgGVckQSuwsnFN2ybgSrE6so9jjnWxxb5SLknUMjog",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFE0XOF4DKQNJQFBg22VgmJ53U2HxRtq_ZxXMW0s_A68deiDFQdh_QnbpaOxQIowGswEkkeZL32hB35HPdLRIaxLJFxNo6FPbgIheJTT76gJ3rK5nt43arvG6vvSSOcqC9J8B4O_wS8Wz6hUz6us799kby0z3aQ9NxccDYsSdlo8vrxPuCbu2FUtUshqNvWRQ7QbJAamzcc7ynC-ZRTdJSR65TDpgLNwh-d-_aHZPgg0CNunXuppSCWcC7WO2XQgQMkUCNyUC97b80j_4AJwY-Q-TYs13adMatG1s2HSOtJg00NaMmnSFTwiiGN6riLh1GeGYmKoVzltXhEvaMOOo0tDkHYfULxhMT4m4RDWArLjvswDC_HuZyvscNn6nf-m2m7mHguPp2vIwQmVrX1f_4WgH1c8yHARlMcP62E0Nhf-hfJIqz-Ts4155rMcRTZ3cRHGouQ0oXCeyFamdaitn2tLVpVfThT9RFvL40ZlXStWLhSkXhJ7kCOGaB_b8B9Ze_EGy8KlYcgPicQP3jN-OZJkEdE6qM4MsOO_o4OK5q-ZtikcjXM29DCVm7ajK2TE7fqpaS9p1qEGu8f4bLspOdAXBmMZw853llcF7rRkEzqHlvkmikU03Zd7FKdVv2XRJT1JMwq2_rnM1U72GmgaogXASlwZ_w5zV4flTDVuipjchLBIqeXfJxbKxU-UytfUrD87FKpprmm1q9S6XGifa-AFdzaZXvG-8q6ac91gT41O2T-wsc2dFw6Anx8nPoFVeR3IWn7IdPWfrFLLl8zCGi8ZiAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTMyNTc3Nzg1LCJuYmYiOjE1MzI1Nzc3ODUsImV4cCI6MTUzMjU4MTY4NSwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInN1YiI6Im41bERnRS1RdTQ0aVkwODQ0NkhPMmhpUHRDeWpxNkEtaGkyNUdWNFVJbGciLCJ0aWQiOiI5MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9."
        };
    }
    getAuthorizationUrl = () => {
        var authUrl = this.getAuthorityUri();
        var resource = this.getResource();
        var clientId = this.getClientId();
        var redirectUri = "https://google.com";
        var state = this.getStateForOAuth();

        var authorizationUrl = authUrl + "?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectUri + "&state=" + state + "&resource=" + resource;
        return authorizationUrl;
    }

    getClientId = () => {
        return "f7b40f85-da5d-44ad-9c92-753669ac4199";
    }
    getAuthorityUri = () => {
        var authUrl = "https://login.microsoftonline.com/9340495b-1656-4be5-9930-69c9d55d001f/oauth2/authorize";
        return authUrl;
    }

    getResource = () => {
        var resource = "https://ramajuly2018.crm.dynamics.com/";
        return resource;
    }

    render() {
        this.loginToDynamics365();

        if (isValidToken(this.props.tokenData)) {
            return <Redirect to='/' />
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
        onTokenGenerated: (token) => dispatch({ type: actionTypes.GET_ACCESS_TOKEN, token: token })
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

