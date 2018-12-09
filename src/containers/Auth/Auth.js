import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { isValidToken } from '../../helpers/crmutil';
import Button from '../../components/UI/Button/Button';
import AdalNode from 'adal-node';
import DynamicsWebApi from 'dynamics-web-api';
import Crypto from 'crypto'
import * as actionTypes from '../../store/actions';
import * as crmUtil from '../../helpers/crmutil';
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
        var authUrl = crmUtil.getAuthorityUri();
        var resource = crmUtil.getOrgUrl();
        var clientId = crmUtil.getClientId();

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
            this.props.onTokenGenerated(tokenObj);

 
        }
        else {          
            let errMsg = 'Error occured while retrieving the Token: ' + error.message + '\n';
            alert(errMsg);
        }
    }

    getDevToken = () => {
        return {
            "tokenType": "Bearer",
            "scope": "user_impersonation",
            "expires_in": "3600",
            "ext_expires_in": "3600",
            "expiresOn": "1544330714",
            "not_before": "1544326814",
            "resource": "https://ramanovember2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IndVTG1ZZnNxZFF1V3RWXy1oeFZ0REpKWk00USIsImtpZCI6IndVTG1ZZnNxZFF1V3RWXy1oeFZ0REpKWk00USJ9.eyJhdWQiOiJodHRwczovL3JhbWFub3ZlbWJlcjIwMTguY3JtLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIvIiwiaWF0IjoxNTQ0MzI2ODE0LCJuYmYiOjE1NDQzMjY4MTQsImV4cCI6MTU0NDMzMDcxNCwiYWNyIjoiMSIsImFpbyI6IjQyUmdZREE0MW1qd2srT2dqYnBqMEZuNXhYdlRXTzhFMnZrN3JTNitFaGJUZlVDSXZSZ0EiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiNmE1YTUzZDQtZGZhYS00NWU5LTkxNjktNTJmYTc0MWIzYWZmIiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJLb25lcnUiLCJnaXZlbl9uYW1lIjoiUmFtYSIsImlwYWRkciI6IjczLjE4NS4xMzkuNTIiLCJuYW1lIjoiUmFtYSBLb25lcnUiLCJvaWQiOiI5NGI5YzdlMC1lZTYxLTRhZjYtYjc5Mi01N2NlZTY0NDViMzAiLCJwdWlkIjoiMTAwMzIwMDAyRjhCODE3NCIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6IlhSbEhEN1RLSnVXWGRyTEhGZUdnMHY0Tm5qa1VhY0NOT21TU0pHcXJzU2MiLCJ0aWQiOiJhMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYW5vdmVtYmVyMjAxOC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFub3ZlbWJlcjIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoiVUJfbnV1T0xRRU9VRXh0dzFJbm9BQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.XsmDLbvIZPVgEOEbGQqMQ9tvBhuhUtk6VPv3HYxMcQ2FuH9MEFasRpu0bPzKc7FojwEBBqWionF7WTjsXyHpXNblISCa84rhU3Ydm41i9-QnY3h1eEcaTXt1mwXaSIaq8F9UoFDmMDwQiGE5QyijD2VQyELy5LYS82h-89u_rIUblpcN4Rw03EUeDKQwiP9kN4c989imMAFQEZf7aOlLkhIBgxDCFLO93y2nwiWIdo5z81rFjKeagZ6mu7nMRqMVlzaIFaRgKWjOWkoJ2trOlIWBG_7ZyJGmA0zAcR_NID6uE7QwaK4wAs9WYQJilV3osuO8Chjo-7BcnJfLBBSYCg",
            "refreshToken": "AQABAAAAAAC5una0EUFgTIF8ElaxtWjTUizKvf15MrYPKJLLd0_L6IVbivmtsK-r_nksgVj6dPVQRW417bxITgEor0_WrM4IcJSFEnHpQpepw4RiCs8joiBT16lTXhrNI-lN6Y59TbdG5ZgkVscdefe4mOuWZNbPGoBEHvlF0nK0S6Zn4NnQTZdKE4RLEoLEWnxqlNWrP5bwfohykAFrIBD96K11vqU3EbeEHYI5Ga1g_ya0OJL50aUYqqclNPR_C3-wj42OlKhGZKidaMIqm06Ii6DwH_NuUQ9TqLAzrIkvwWe131CbABS-BqMzBl_yq8Xhb8SJY1HF-4JNUCwuyDS4NpOtzMn7_8vXjuRM6MUinHPs6QJiNRD1Y23nJgykOX_lAa6_mwEDSgzwWDg5mnWwR7fEk5Clycyxfpngx82AwobBOIQMkos1ZxBF5MeYk-PszqcQ6BGxRvq6qk1pe0CII-iWiBTejkDqQ9gsT0QSXeBrDgxofcspDXa4LxDTdWCC0md3URUh8gQtJmvyUz0NITmUNxgPVmbECu_ow7ZmX4va89Ccs1KgjuS0EnD4djbrMFv4t4jh62d9ca8LVlzHi0hMLh5dYFcXCEvfmR27O5ZLge7VNnvDZTjfF4LCElJseFKUPWELoicV_twZ0LUbNoTerhtDNzF93GzMCnj3AUgHo_zvj2KKpP40vVsn_YfsXThY1d16itpgGab-U-5OOu7pvG-DaLvG_n3Da-0F9OnRTxoajje8bxcNccxFVEa37RhlLgL9eIP3zSixRQ2IdB7h4AQli1YnoI5lWahFtGkKkW4Byd3pHjlWXnkdoZuI4ewcHhUgAA",
            "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2YTVhNTNkNC1kZmFhLTQ1ZTktOTE2OS01MmZhNzQxYjNhZmYiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIvIiwiaWF0IjoxNTQ0MzI2ODE0LCJuYmYiOjE1NDQzMjY4MTQsImV4cCI6MTU0NDMzMDcxNCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6Ijk0YjljN2UwLWVlNjEtNGFmNi1iNzkyLTU3Y2VlNjQ0NWIzMCIsInN1YiI6InV5N200YWhfV0xmWUZndlNxRFF1alNEQ0dqYlMwVmdXZzhxcWJaNDNQdjAiLCJ0aWQiOiJhMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYW5vdmVtYmVyMjAxOC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFub3ZlbWJlcjIwMTgub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
        };
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

