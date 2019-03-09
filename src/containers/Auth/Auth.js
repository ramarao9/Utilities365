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
            tokenObj.willExpireOn = this.getWillExpireOn(tokenObj.expiresIn);
            this.props.onTokenGenerated(tokenObj);


        }
        else {
            let errMsg = 'Error occured while retrieving the Token: ' + error.message + '\n';
            alert(errMsg);
        }
    }

   


    getDevToken = () => {
        let token ={
            "token_type": "Bearer",
            "scope": "user_impersonation",
            "expires_in": "3600",
            "ext_expires_in": "3600",
            "expiresOn": "1551668971",
            "not_before": "1551665071",
            "resource": "https://ramafebruary2019.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh3MCIsImtpZCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh3MCJ9.eyJhdWQiOiJodHRwczovL3JhbWFmZWJydWFyeTIwMTkuY3JtLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMvIiwiaWF0IjoxNTUxNjY1MDcxLCJuYmYiOjE1NTE2NjUwNzEsImV4cCI6MTU1MTY2ODk3MSwiYWNyIjoiMSIsImFpbyI6IkFTUUEyLzhLQUFBQWlQdHg2MVhhaXlzREN1dUJ3WnhiNFFFVkNMTCt0cDN3N1d1NEVKNlVQSnM9IiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6Ijk0MTUwMWI2LTRiZjAtNGYzZS1iNmVkLTY1OGMwYTU2MGE4YyIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS29uZXJ1IiwiZ2l2ZW5fbmFtZSI6IlJhbWEiLCJncm91cHMiOlsiZTYzMDg0YjctMjI5Mi00ZTUwLTg5NWQtMDk3ZmZiYmFkZGQwIl0sImlwYWRkciI6IjczLjE4NS4xMzkuNTIiLCJuYW1lIjoiUmFtYSBLb25lcnUiLCJvaWQiOiJhODI5MDQzNC05YmQ2LTQwM2QtOWYzZi01NTg3MDQwYWE1NWEiLCJwdWlkIjoiMTAwMzIwMDAzQkJEQzBCMyIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6Ikl6TDk2VDRBZkJGajZKRmZoT3hxSjUzM0pwLVFxaGk2a1NFTzBMLWVDcGsiLCJ0aWQiOiJhNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWZlYnJ1YXJ5MjAxOS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFmZWJydWFyeTIwMTkub25taWNyb3NvZnQuY29tIiwidXRpIjoiUF9PZVM4RXdLRXlicnNXeHY2TTlBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.OYH7UJMaGKApy-YJhXNiZXhbO69aAnJwEoJlV9KownYfMQ4v1CrKvrhOL8ix2PAxstd6SmvT-rmvhgWZlQmmfriKZ5Ey1inNtlIkccd92fGalikCO-MJNMoQ_7Jk07XEGz2x4R6Ju6Bp_Z4_-pbIVfSx4F7RI5FHfDirg62o9apo-GK4zMw55sHUECo--zYCUNcusahYKK1pYMUL9fhL8XJxKUqrO_99aEJtf4KU9RBnN1yuPvAICosQXYAFe7wUxuJsxNCLCGOTRwpouljYEy-LapS8t_6_aDp59jA2seHlDWZZzYhcMw09cddLQvVt3gl82hwVRcIzqEuGrzGgsA",
            "refreshToken": "AQABAAAAAACEfexXxjamQb3OeGQ4Gugv-kKCJs3KYioX50Xto-vpUMFW0l7zeTQnMO5ABSGfNwoePcV8wjMq6Gu0BZ7PW6sRGPm7SI6rgPY6FyTyi0h33o6I0esQqxZeEbCQFwNBQrRXGyZBLJCyoqpxCv8WbhrBKRlbGCE6AByQ4tsmcYD60zpTd-b3hs8sd07WkDFOLvBm7xeRlZocwTqFMMdgn0xvscYws5zyxwowgqKw_ycB-fAB2d1AG2rpDKSP6BX4ncPDsyGt-4PTKeaD8sNVAU9mzmjaAeBp1lI_Gcq7iFOD61fE4s7jhbSXaEvHU4YY1_zfSWx8WLtd8f8Ct9zPwJXxYvZ7R8CgomSoDWhi-zGWUBNpPrEzmOyr09b5eJtaut6_QtSHAQqJOHVlEr5FOcgNTFobf4inRsqq8jcd2ExqVzSSBGRPt6FLb3i9-ltCTa9GD4A2_qZHieJazD-ibUvuK99LANZvYNEd2NNSZo-BZihBlH8xVwDnzxVxl8s9-Kdno2QMy8dhyD-G-ZEuPVGCuakyCq65bszxezv_oksifWnu0zleKnsRE2O_RQqfxkkoO-es4nHerjkyB5hUP7Kslek-Smyuih7gucmb4_NSprntC21UdBCCN8y4AF1QEG72aT-ZYFSyZffZfmyuNse3S8nqsnAetIZqYuLVceHCZ64dUvQJutE3t8bNuiEuMizO8X5kT08pN7yyxejXya2IEvKBIRQwaKOI0lMQKgrN08vl-1YUwlDN1g4mNzz2G49vJj4UHwke_YP3u54kZfxzVwpoHpQyTBqYewzGJyJ0Hv_gsScBSTNq01bZWyTurhMgAA",
            "idToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiI5NDE1MDFiNi00YmYwLTRmM2UtYjZlZC02NThjMGE1NjBhOGMiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9hNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMvIiwiaWF0IjoxNTUxNjY1MDcxLCJuYmYiOjE1NTE2NjUwNzEsImV4cCI6MTU1MTY2ODk3MSwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNzMuMTg1LjEzOS41MiIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImE4MjkwNDM0LTliZDYtNDAzZC05ZjNmLTU1ODcwNDBhYTU1YSIsInN1YiI6InNkOFVUOVFqZkVxejhrVXNBUkZKWi1FT3d3cVNQQ3F1R012bDlodzhHa1EiLCJ0aWQiOiJhNjBmOGE2Yy00ZWZkLTRlMTgtOGRjOC02OTgxOTVmNTAzZTMiLCJ1bmlxdWVfbmFtZSI6InJhbWFAcmFtYWZlYnJ1YXJ5MjAxOS5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJyYW1hQHJhbWFmZWJydWFyeTIwMTkub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
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
        onTokenGenerated: (token) => dispatch({ type: actionTypes.SET_ACCESS_TOKEN, token: token })
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth);

