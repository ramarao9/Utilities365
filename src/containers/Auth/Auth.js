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

        if (tokenObj != null) {
            this.props.onTokenGenerated(tokenObj);
        }
        else {          
            let errMsg = 'Error occured while retrieving the Token: ' + error.message + '\n';
            alert(errMsg);
        }
    }

    getDevToken = () => {
        return {
            "token_type": "Bearer",
            "scope": "user_impersonation",
            "expires_in": "3599",
            "ext_expires_in": "0",
            "expires_on": "1533273296",
            "not_before": "1533269396",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzMyNjkzOTYsIm5iZiI6MTUzMzI2OTM5NiwiZXhwIjoxNTMzMjczMjk2LCJhY3IiOiIxIiwiYWlvIjoiNDJCZ1lGQktWaTB2bkx6MlZreDF2MGZsTmRZRFd5U2ZYdjBTTEw1c0RxOWV0K0dXR3hNQSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoiR3o0U3pkekpVMDZZZkhCUnNhY0NBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.J1MxnF5TSAFru8p76A-rF23Pn7tCaP0hRuLox4xhaoO1JwgTR0Qavtyd4jluYQlXeWyAQX6XZNYaFVARmLymqxfG4V5zV_cEpeha88SfYB30TUpvhxdTAN9WiH-3ev4PZ8EvY_RrtiM6W_9mtlz60yAxDsW8gp8US1W-nSAGJSpXE-QtgliaZsl-GJlj_J4FvQOciu9lHpjx4RkOzKZqhd9pjlQKjOVSpMGcvMRHzaY-AkfV4A2tbIWuuUVkVlyZRgpMSr1pTvQhz8jlqKDpJTTQLHcyLyOJDXQ11bC8049B1wNS87nFDcCCgSqrAUMwoiRukzjfJ4vOJRikXFeftw",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEoA8AjQN9Rmv8KjuMQZHWZSlxFqs-PPEA-sUz6kl2E2Ta2mP99fTaWD3tMVV433Dpq-KDNNlr6hovvtGwQi5TOXhimqwVRD6aI4N_6jUiWSYmrH4V_7ou6R_bzGvZGOblF1mqFagyfPzDRwPvkoL6FQWsaWxCh2N0GPnd9cPLblnu4Ofw51QoCHA4lz7XFpP5goRPYB5d0EhrHF80JDUCrgBgeOFB4OntE0W8O2__mS4WMtX1Sy2-4w9qc-nxJcAjyw-n8MdFvdTjhMBuYgfEQYoienLb4CdM3897JDtfWjgMJyztXS9TtV3lZsIx7b0Sfd2iKUAjYSoEFtljqb0T-O-0gNSXkjW6J51V2sYCCmr4Nr3v5jtckxwAeeEL_SGtSTQ40hhhFyq1YkJlw1jN0Tl_AjgBhN9meNT3b61Do-j814W_2n85EWh_o6XjvBBIDmkoyrR8F7sGzHU-B8jATDGzMBtTiWN6bNk-9h3D07lzHRQ3dXIaFtGePrZy9NxbHJgiuQo71FoVAFRtWE4fFY-amJdsEgE8Vv2Hs3JThL1ybMKlX6qhwmm54yHzko9e-ckJv_T2ndjrl8td_AgPvjGpF9sYq79473WVOd0izDFg7PVivEzVSNUCUkyg5YwxtyLwOk6I6SZaq7NiqXJcol9w6vhyphzeYIyv-CxuMs-AwMY3hqwVOG-QYLTo_1FeFu-Q-fgK_rYNWD5DlZCKOD__9TnzRiDb4l4jFSWKUsVaCxcX3XxBkkJ3ZVyqr5Q0o7bLWqzZnSG_wvKpWw52KSAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTMzMjY5Mzk2LCJuYmYiOjE1MzMyNjkzOTYsImV4cCI6MTUzMzI3MzI5NiwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInN1YiI6Im41bERnRS1RdTQ0aVkwODQ0NkhPMmhpUHRDeWpxNkEtaGkyNUdWNFVJbGciLCJ0aWQiOiI5MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9."
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
        //  this.loginToDynamics365();

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

