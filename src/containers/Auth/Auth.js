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
            "expires_on": "1533097861",
            "not_before": "1533093961",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzMwOTM5NjEsIm5iZiI6MTUzMzA5Mzk2MSwiZXhwIjoxNTMzMDk3ODYxLCJhY3IiOiIxIiwiYWlvIjoiNDJCZ1lDaWJzYkJqVnNubnN1UENNL3J1M2hWUFBDL0IvR0ovWDhIY1hLblBwcE9LaWpzQiIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoiTGF4S3RnTXVxazJJTlJIZjh3NERBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.IwPytrbeuRRjDxFMhRPQsnGhI5h3cYDJfLB3NGRuKhpxGawnThBBrJwkzlBrrcZEgq46p6nhaCR9kNGunzwC_IZMtyrQ9FxddZ3ym9Ae6IZmRuPHeLFMgO1BA4cNhxOe2MFM3jEG3qEWaLLI9M_59pqfoWwzqIOK_UzNqU0QgjfI3Ig-SNpmhx9IQdJa7VSUWDK4xWdjUgB77UnYLAXHcv9_oxPRFcvP0jNvaEPJcJ01fZEl2zcWR1w2w1C9g9Tj-lp2bh0nf5OR7eh3MPHb3RcvOnlXdqVQEzbxA8rUe2m1amICcDyBxw8StDlNY_lgIYTew-uo9jMRL7hHirPpOQ",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEnc70EVmtKpqD2WyzP3Ub8TfLkW2aDNaNSxL93xXlPRQA2NdOkDHyJtxQiq3LOxJzY4qDCCKazRcdj2-2e7jg2R1QRe5ipykhlFn5jzL_Y79-6NiYp3h0d2q2Zz49cCqnpkeWr0Kf68fteGgBKQWIgA23nYPaWLVMQi7mM3mixi19O-n_zMvThoNHp0xnWy45SuJyr2jXIdD0NBJXldn--GO5Ro3ZDvK6QXeCXhrDNdAyEJ36vFOAcydVBsNiMK7R7GSVRX5g6HOH5McpS2-PrR_UIK1ohZANSD0MSAqURxDDSqwS58Z3WsZk0LuG7zpiCj4jy0J_zUpQbWn-__oxxLhhgl1Itdn8OT33DU_f2olk1FeqDzCfZnwIDa3qJY2FizDuwdnsaXxpSMUd6v6JKu9xJJj-W_N1gJ4PYOMv4BuRX82IrhTCG_SIRmjltM9MdJTnfb0LmAqWNypKYjcbVhLeRoTLf-ZoDG7FLzShl-2AKHAntDsz-oqPLehSTOapxCtKiHszxheJMwwh2pPDORHiXvR3AqIJMIvK7zWU3uPKAB29BOgzihZqEutTQNcWN57BUUApve_6jjoPTkiLnV_8mN0m6DwrOkn1pM_96C3trnFPXive-zdsMUkiFLkvFqasq8Qu8n01-jgtBEF2Qt1MKOfeW-SMMfwCLtt9lQRKcgplENGgXtsfg2JZstAhBUqYUA3TAY85PmOglvLNRA_y6Qtx9rr-G6s4-CTyTE1SoPvUVmKI1DcbOomQVI4B9MXudiihputSveUBoip7VyAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTMzMDkzOTYxLCJuYmYiOjE1MzMwOTM5NjEsImV4cCI6MTUzMzA5Nzg2MSwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInN1YiI6Im41bERnRS1RdTQ0aVkwODQ0NkhPMmhpUHRDeWpxNkEtaGkyNUdWNFVJbGciLCJ0aWQiOiI5MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9."
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

