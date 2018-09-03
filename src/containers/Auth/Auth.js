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
            "expires_in": "3600",
            "ext_expires_in": "0",
            "expires_on": "1536000667",
            "not_before": "1535996767",
            "resource": "https://ramaaugust2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFhdWd1c3QyMDE4LmNybS5keW5hbWljcy5jb20vIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZmY2YmM1MTQtN2Y4Zi00NGViLWIzZWYtNzMyYjc3ZjdlOTg4LyIsImlhdCI6MTUzNTk5Njc2NywibmJmIjoxNTM1OTk2NzY3LCJleHAiOjE1MzYwMDA2NjcsImFjciI6IjEiLCJhaW8iOiJBU1FBMi84SUFBQUFEVGxJeUFTait4cmdiQ1pSWFAzN0ZUU1kvaXk0ZExCYnVjNDEyTGZ5QUEwPSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiI2NTQ0YTM4OS01YjlhLTQ2MWUtOGMwNC03OWMwNjA1MGZmZTMiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6IjMzOWQ0NDM4LTk4NzEtNDAwZC04MzViLTZlNTZkZTQ5YWY2YiIsInB1aWQiOiIxMDAzMDAwMEFENEY2NURFIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiX1FnQVFhRTMtcjJjdnlDQVpUdE9CX1BkdldJSURYS1ZDUjAtZFBsZkdYOCIsInRpZCI6ImZmNmJjNTE0LTdmOGYtNDRlYi1iM2VmLTczMmI3N2Y3ZTk4OCIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hYXVndXN0MjAxOC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFhdWd1c3QyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6ImJqQVFNU056VUVLQ2FUeTdFamhKQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCJdfQ.FnOuFsEck8I_bcJaJqvcrUsyQ5XFfPlUc0pAZIzjB4O7xw_WD9hmlMmjE4RH4EJRtxQVjV7SlAiqqCG3OZVh1MngAkhUX44ikcLJdD5q3a4T82kfdf7W-_MxQA4ka9nGBcWgaQhgYQBKeRkGixkXppDmRb9xAa7cSJbXLuGlICXAtHkJS5ar6Z8QKjNOhSp7jkleRA45H7glsFJmT-EZ2cvTNvJSgsEH1UAwwzlmBfRdxf4dzVolufkluYQA3ML84GCg_0gcWwBZ3vZ0xiKNijEKMKF9JbhYj2TxaUUhugiX8-7Kwx2JPdQPvqKWtOsuh6fpxODSGCTvIOlVq7wRjw",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEGGODRJApcxjHgeXru-O1vLfinMCHBRITIDWBDG6EDJazMoil_gF92vKQBDNBtvCmohuDkBx68B5DJ01o34QiCssDHQtRj7wmbMGrxiMZSKI7CezKmmceNnETuKn0xVjDHnvTyHww4U9b8A1gy8qN36M-TmfQ4ijaOPmHRjyWAQ5eGRL_rC_ghtMZ4cMGRUS9kC3mthYUbjKSLdUFYcc0N271st6rHYyCqf5Sd0TLnsRsKdt4MNtY-UzteVttnXFuk2q2jqikKiafghEpw40185sGB_pyb1zscYN51NRFPEbTM0h7lTvgqYL-y3rLQLOgfayouCD2RX58bsHZ7qGnEeV1prtsR3mAFS0Yt6qfGGpIOLvWuygCbpoVsJW_VG2qpXsUXQjm0BMsE5CTGhhXJEQMctclkSBLfs7KYB9N8ac28Cn_PhEC1ryoKan0SoFC8EIxu-Bvj3QM4ntq17UZsswDfA2eySRsMMD9BuLfb3ngWKavbHGIzNrwCHJFX_CElihG0zp05kTiu3XobvtDqhYt-9glp_PGgicpuyK8_CRwYFmnhrGAr0fEtkpOfNoocnscYMsPWAyopEchAMxXB_u0k3Ch9wirFDmtuGDKKDopaxvBtQt1FXU6_G7RfuPVJoukrVN3VHSHpsh3c71xX5i7yaP3EtNVRDmh8ZJFfAkpTAHQu_qBLL8BHZIsWJkLiQAW2tZeqseQiICXIGmigC7ONQtFZb4-C6HuqseT6VdHRuaFHUtIAEeQr535wl6m0NeTzMcE6Fqb9cFeuBigPqBOPWo9N6uOXdmUrh9UmLMgAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2NTQ0YTM4OS01YjlhLTQ2MWUtOGMwNC03OWMwNjA1MGZmZTMiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mZjZiYzUxNC03ZjhmLTQ0ZWItYjNlZi03MzJiNzdmN2U5ODgvIiwiaWF0IjoxNTM1OTk2NzY3LCJuYmYiOjE1MzU5OTY3NjcsImV4cCI6MTUzNjAwMDY2NywiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6IjMzOWQ0NDM4LTk4NzEtNDAwZC04MzViLTZlNTZkZTQ5YWY2YiIsInN1YiI6IkhrVS1RMW5zNkZ2dGxsQnktUVhBYllleXZLZ0o1NDRUc1pTN3VTN2NHY0UiLCJ0aWQiOiJmZjZiYzUxNC03ZjhmLTQ0ZWItYjNlZi03MzJiNzdmN2U5ODgiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWF1Z3VzdDIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hYXVndXN0MjAxOC5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ."
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
        return "6544a389-5b9a-461e-8c04-79c06050ffe3";
    }
    getAuthorityUri = () => {
        var authUrl = "https://login.microsoftonline.com/ff6bc514-7f8f-44eb-b3ef-732b77f7e988/oauth2/authorize";
        return authUrl;
    }

    getResource = () => {
        var resource = "https://ramaaugust2018.crm.dynamics.com";
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

