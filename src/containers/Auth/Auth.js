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
            "expires_on": "1534697714",
            "not_before": "1534693814",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzQ2OTM4MTQsIm5iZiI6MTUzNDY5MzgxNCwiZXhwIjoxNTM0Njk3NzE0LCJhY3IiOiIxIiwiYWlvIjoiNDJCZ1lOaHRVUzlsdklEYjdMaUVmRytkeEtJb1FjME5xMy92bXBBUjlmeDU5S01PRDI4QSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoib2NyUlJJLTBIRXFPTVNoQ0Vlc3FBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.K4qhG2g0JAnrn9Q2RQol28hAJzsqtztWhGtuiT1IjxcRzoT_zEBQp9JTQox_jjPknnsD9GFgIto48beHsyiOKeegWEJP14wX7GW-Cea79V7XuHruaThL4E3MGBA70fZ54Ucgwi13l0kJTK-BKGiQUJ-IJGuwtiFvEgBc-SzLmTkwhoyktThqlKXpCrTzjhQe6LlRHPiZ7ixln2ElJvZCsnYBjra_XaGPvD_RQFfIR4BZ-tVH45R6yflncl0ywHMUzPjwMYtIYJkC18yVAiWueCp8Fs438yVR5U9fl490WNxLu4yhFt4lQOqZXcMvZX8VRomO6v5UgyYt-kLLXanP-g",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEIqT2-oiY0M3m_dkqAYi94rpMplnkI59C7M9XChLDQKE5w6LPZ5nFuTa7WNZh4YCmzgk44fNeCfZ23Zz5GaURwLPcJvGXEVcFAoly-Od8PqbtftFe_ufVL0Y8hhq_CmF7ENCYjNelKCMoJZDTHxxxkXiAgble-1l8LbSnkijzBvUOZfemFzGM2el8i0Eol6iCYZxivegm3-6zqYP3SCrdIsgVaiPmcQisrTdWFSiv1w1PwPDYq2iBsafW7boLXTMFTngtoMPxuiVRz5T-U2dOE3EWAHrdNUWE8lIh-4xiRbLeRFBcWjRotAWFkJlEnSlGcIuroF1wIy9nSDqhxWRpBmXA4ieNWopR-KzLbYvjr7T7rkwm-5IQCluHcjqMD0FZqHxqN9ZY3HacCUPV_0Zf74yQCHEzoi-2QvTKgpwTSMYJ4_E11dLLL6GvQO3fCpW04EKcIDcM8-lCFAdzZq6sUG_JIbFpnoUfHsC63nkqAyeeKvK33GNu58RoE9rwPZ2cAh6NgqThoSp2WA95qwRN6n5kFZD99eL3NPBo2WmF-1KD7sLWkOyHmknIovqvrMMD_H2dtscBP9JthRLvT1y3HUWaksyYVEsr7STxRYzJa-OuL9rt-FReUPyv7F5-5gWEdVyInJE_YonIktfSqOBhI8zYLjSe51NXrXU0tndC_IxnfobAp7kjPHUiM81t9AN4mbzcASQDdBXhwk5d_irV2GV09p6TC-GNAuvyYLA3MR1t82r8WjGbIC52F7cBMbv33n0S4kPll6ntfQcGvq6qKiAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTM0NjkzODE0LCJuYmYiOjE1MzQ2OTM4MTQsImV4cCI6MTUzNDY5NzcxNCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInN1YiI6Im41bERnRS1RdTQ0aVkwODQ0NkhPMmhpUHRDeWpxNkEtaGkyNUdWNFVJbGciLCJ0aWQiOiI5MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6InJhbWFAcmFtYWp1bHkyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9."
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

