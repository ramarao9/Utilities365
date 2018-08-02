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
            alert("success" + tokenObj.access_token);
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
            "expires_on": "1533183666",
            "not_before": "1533179766",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzMxNzk3NjYsIm5iZiI6MTUzMzE3OTc2NiwiZXhwIjoxNTMzMTgzNjY2LCJhY3IiOiIxIiwiYWlvIjoiNDJCZ1lEaXlTdHk5MnI2ZGo5dHJ1czJWaDJjTG8vNHUzWGg1NXM3c2JWYU9NbTh5WFBVQSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoielpnNUswY0pma3l5Unp1cThpc0xBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.WhymLyuy9-OmROOsOVfo81th53wdWyORsNHqrkLP0vHrDcftPJhBNamVd4xSfRjjq1E8_CvWj_AplANpB4E5fwhQeFEHq49Fc0bMO5BiJgQUCaHR8f_BYl2m0AV8yRFbkfkzv7fPtHsZVsZVV0xUvXghEepjlKOx82eQCkFOYwst6nPXCO19ewLrE79FIRcY4zGtuIy1941nMRTcuhUGq1euZoh4yGtOctRNG8z8FhtyTunvrlaN-SFWsbPa-tDBmY0i8ZdQ3urdSto-Ei55TuoO7HZA_b0lENWQpXtPLEiduSrl-ymW_ENhY21Q1epFXuciTcN95u3yN1ufo6rNGA",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEhfMkxgsS2-FIA5DRcES_ePDOtDsr-FqJOWyw_Btf_VJj2PQ1VBuMCISE-SyGsWk4lEs1lVAoidF-3Kc2c0yrsvjhIbaQhgSn58UJ1_KIucJSM-oKsib0UGll_0uvWV31VpXEo2CPBXkHBBCFxOigToJDUQFHzmsDYzktaGR1yTCrya0zJGKfYKMXaZQ_VXwkaamq8O5LOPHAdN7e6SWBruHvDY2yvrubVya_bbePKlrftYx7j_ixZeM2uKTnt6Z3qB-n1eG49jzaDLNXG6UQPLC2OOROsILsC37yaJsIZ64-XOmNvegiGbklndJOei4dB7LqkKJSWbPl0J0Qc9R-Ly9TA42y8lkIzX_-BI6zLsnH7OOGT7XLTtvrENmCBpg1xDXf2Q3Onm3fHeMNCggOxlWbUeyNAp6EM1AppVi5s5KC4FgtnSZMiL6wNK2QDO0gAd96V167cs4rjyH15N6B4-oM7HqmC0ApoPYBKq-H-gfPxO6f0_EFSnYFPYb1ZfRwB5fJbgy6qQK444ByGWaVRPdqL2Sz2dr5CEoEtGYWoS4AcoUxeGzI1dCTxPpY6JT3zUzzlHVwsVMh-nKMWmkX1cmaX1eaWLiiOtXrj2QrWGzKRnIz6isMMzdratSZKNA0tlIsn8Q_n6Nl__h3KctU8yUYxI3wzk2KPlt0H_sEWdAFnusLpcoivyrhjRRJLJ_Uh-QPO1yiGG8z-ON6gv_8rAChUEbzty-FTB1KQZkkBWL5Lonc_vWL-9qd_gAenA920X-7qC6XeYXFPENGBCy5QCAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTMzMTc5NzY2LCJuYmYiOjE1MzMxNzk3NjYsImV4cCI6MTUzMzE4MzY2NiwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInN1YiI6Im41bERnRS1RdTQ0aVkwODQ0NkhPMmhpUHRDeWpxNkEtaGkyNUdWNFVJbGciLCJ0aWQiOiI5MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9."
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

