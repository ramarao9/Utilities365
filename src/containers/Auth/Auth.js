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
            "token_type": "Bearer",
            "scope": "user_impersonation",
            "expires_in": "3599",
            "ext_expires_in": "3599",
            "expires_on": "1542483704",
            "not_before": "1542479804",
            "resource": "https://ramanovember2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IndVTG1ZZnNxZFF1V3RWXy1oeFZ0REpKWk00USIsImtpZCI6IndVTG1ZZnNxZFF1V3RWXy1oeFZ0REpKWk00USJ9.eyJhdWQiOiJodHRwczovL3JhbWFub3ZlbWJlcjIwMTguY3JtLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIvIiwiaWF0IjoxNTQyNDc5ODA0LCJuYmYiOjE1NDI0Nzk4MDQsImV4cCI6MTU0MjQ4MzcwNCwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhKQUFBQUpzK2tLTmgzSVQ2ZFpyNklSNEZzRm5QdG55OGF3Nks2V2JRM3hzanlrYTQ9IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjZhNWE1M2Q0LWRmYWEtNDVlOS05MTY5LTUyZmE3NDFiM2FmZiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS29uZXJ1IiwiZ2l2ZW5fbmFtZSI6IlJhbWEiLCJpcGFkZHIiOiI3My4xODUuMTM5LjUyIiwibmFtZSI6IlJhbWEgS29uZXJ1Iiwib2lkIjoiOTRiOWM3ZTAtZWU2MS00YWY2LWI3OTItNTdjZWU2NDQ1YjMwIiwicHVpZCI6IjEwMDMyMDAwMkY4QjgxNzQiLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJYUmxIRDdUS0p1V1hkckxIRmVHZzB2NE5uamtVYWNDTk9tU1NKR3Fyc1NjIiwidGlkIjoiYTE1ZjcxZmQtMWVkZC00NDcwLThjMDQtOTkzNTNiYzhjMjhiIiwidW5pcXVlX25hbWUiOiJyYW1hQHJhbWFub3ZlbWJlcjIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hbm92ZW1iZXIyMDE4Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6ImNRYk1SeGd2b1VpWnZ1NUVUaGNZQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCJdfQ.Wi8i0mTZVqVNMX0NwlFvWOMqnSE0kPOcXvgFxJ8wqdQ8cZ1T8h-d9oVI_Tl4InPCLzpOEgtGrKY7NeR7E_8q0DQAxBQ1p3vc8d5fyaFVHy0ZINcsV3d1etTNA1JWkDR9_fe4pCBDoMLLezS77e00gLBTufDYQOgNhL6ZVQykfqNlZZXEYmJaKeUey6-cuO0v3EWS5UKWKG4WtjIinXBjQTM4s9iZo_r-UOXQFeHsjfxi-2dvNPJsfu7QA4qy3xtCvwF4Lab1WLBqaxVyIV59Y2zDtXGkRXLtqp2SGoq1sadBJhmwvGk1spQNK-jRZjeMseQCTRrp-cYU3E7--4O6gQ",
            "refresh_token": "AQABAAAAAAC5una0EUFgTIF8ElaxtWjT0ki7Nc8lFjd7_E7CPK46zy7b7s3m7yMRNNH4LktOOE6eG2jX-C9024Q1d42nfCWRaqU6dxGtqDy1cGYb7C5yAE2QiAbJPVwPyIW7g9xh375F3OsQFrb9yOXco6DGTeOm8y3jZFfRbBRvrT4e4adR15AtE5kHU-bT_x1yewKNHfpQezLxlgpyOg3kfT7aibsqOTGjUMO0zr2iNEUTwMg50HaiOFS7wSv1e1CRaBa-qqWIH1gXQbpHHLEEqvESVK6QvD2j1igumlzwp8fjxZGcezqKrMckQzxTH2U2ax5P7vB9FHhJDQR5T-8g16WQBojpeSDnH_Epd_OAB8Lw1B4mikHEmYdqweUKIvKYxcKI6CpzYHuw2O8eUTACUcSQjj8ESUJjtW0RWLVPJKEwGcYhvGrJJH86XaA9pWiozhUDsBgmn12-iwkqZMScrb7vyUKI29XkpDXrE7g2NDnC5dDx7KbJQKRoO5zrZNhIb7zuJkr8Eq3G3apdDU_id2vvNPQWA4J2WpmLBnhLwBOvaoKp8vWxqsBY-BtqYulYi2-7yyrvj3ityqFwHpbHD3YdOILyGTV9MLo_4clF_8eLHqeDMsWYyUT9NB_bYU-9xETgn7Qe9uvOdaO9xLwvwSjR4ZT1FMCWFZPu61-7kXTJekFctChWG29AldKW7leaUpuhUm2am5_XKcYAuh_5prRzAggOAkpztH7lv6SJ91xGcbgrzIcMNMv1ib3PK-8baTgdU7XWsUNsWtaXEnBuffgy_4kt64a85C1SuwrNYRwsdFnWNPkp4XwzF-Ysso5dotXt8WsgAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI2YTVhNTNkNC1kZmFhLTQ1ZTktOTE2OS01MmZhNzQxYjNhZmYiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIvIiwiaWF0IjoxNTQyNDc5ODA0LCJuYmYiOjE1NDI0Nzk4MDQsImV4cCI6MTU0MjQ4MzcwNCwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6Ijk0YjljN2UwLWVlNjEtNGFmNi1iNzkyLTU3Y2VlNjQ0NWIzMCIsInN1YiI6InV5N200YWhfV0xmWUZndlNxRFF1alNEQ0dqYlMwVmdXZzhxcWJaNDNQdjAiLCJ0aWQiOiJhMTVmNzFmZC0xZWRkLTQ0NzAtOGMwNC05OTM1M2JjOGMyOGIiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYW5vdmVtYmVyMjAxOC5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFub3ZlbWJlcjIwMTgub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
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

