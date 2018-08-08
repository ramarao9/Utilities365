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
            "expires_on": "1533698481",
            "not_before": "1533694581",
            "resource": "https://ramajuly2018.crm.dynamics.com/",
            "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyIsImtpZCI6IjdfWnVmMXR2a3dMeFlhSFMzcTZsVWpVWUlHdyJ9.eyJhdWQiOiJodHRwczovL3JhbWFqdWx5MjAxOC5jcm0uZHluYW1pY3MuY29tLyIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZi8iLCJpYXQiOjE1MzM2OTQ1ODEsIm5iZiI6MTUzMzY5NDU4MSwiZXhwIjoxNTMzNjk4NDgxLCJhY3IiOiIxIiwiYWlvIjoiQVNRQTIvOElBQUFBMHE5dVRUL2lQMEpUTjdzdFBPbVV6VkdmUW5MaW9POC9vWUcxbXZ3d3Vscz0iLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiZjdiNDBmODUtZGE1ZC00NGFkLTljOTItNzUzNjY5YWM0MTk5IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJLb25lcnUiLCJnaXZlbl9uYW1lIjoiUmFtYSIsImlwYWRkciI6IjY2LjE5MS42NS44NCIsIm5hbWUiOiJSYW1hIEtvbmVydSIsIm9pZCI6ImZiMmMyMTJjLTY5OTAtNDcxOC05OTEyLTkyNDBiMGY4OTQzMSIsInB1aWQiOiIxMDAzN0ZGRUFDOEFENDI3Iiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiTWpEVC1pV0ZiSEZseWhyb0RxUEFrSERnSEZrdUNsUlJBV1BiR0ZPdkQzcyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXRpIjoia0wzaG5mNjdiRVd2YVg3ak5Jc0pBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIl19.oIUjrURU1ooF7TL21zbY1Ac97SBEnyF1IrNYUPOuWyxfzGES7k-CMsM8zFNstECr6gpYZ4bEo3yT2n19ogBD8SQg9wPV0ycXfYHB_EuNwXD3K6o5bn8q-pk8lnW08UlQdp-0L6zMgVZQOjHwvdv743NejBYCFEneH71jZr2RUhnGSn-hzni4v939XRyi_xaowD0AhTr0DHng7CFPJLupoWS1GsBiSrpR-b_84eFuX1QBcun3g8X0E0-GvIq8J4kd1nnikORCweMdeyNCwEbN7LOpbIZgCihosi8gl16kfZvBsAFFsyUdAF4IY-VChiaJANIaguVE8YiXu9iESwc6Pw",
            "refresh_token": "AQABAAAAAADXzZ3ifr-GRbDT45zNSEFEWx2fLr04CyTlkZq1eHiLfnkG6qoVz4AI7VCObu5UUi-MrZHCb-W33PXgDVx2XrAfKxrmixH0On660nNBPcvKAk0bDUHT5zSTw9ITg7BvE_lqFmbzx9X3-GqgL5AsamOOYGDYxUzaDZgTO4RgP0vKRzP_kTxsnqE9mk3QCVvjm-gpvHeDpd46fg3CDt9rZ93TFyoBSNLGVAZxi-2CYui1amvTMV5tSCs_VxRVVOzGkjhU67gfpUf5M2bkmc_xnDx8f-ATfNu5-9Wd0ODADqed8sZYaOOBIXMEDWQp8FhflORQejb2IrXn16-gWSVAtoaHCBkrm1XhmENdaRjOLTp63Jv2fXBM2HTBJp_pNVtdByZGW4Zzi0aOJmJXZujGt3U054zpOx7zZ9vnYCPMt-GMqKZ4orOqLNwY0pR1b6Fb_N1Kn4vauUdcfW8_VnGDIkNrf3OmJjFcMG1CNhVYcKtY_Lb-4rZO8vfM5eDQ3hlDz-eAKk4V61czL5gR58y3ATpbxXBBAzL2_pHXFN2ZamUh1xrXZGzmTMu2eBmweMjUPiZ1U__f8EwbVnf5w-zV6fvKv_zfxYUGi8RR6z73T80Yk-dO9Cpn0EJMuluVdZulFIaPHK6ey1cxe_b5hFM_t0z0_BdXhXc66K13zRr9muqu7CX0nJ7LIiArQtnWC5sotEn-7OZ3lrDU1bmzcsBa33J7TpRAQxir3BXAnFXWrW-4HwQ36bHFvOh6JdDxdJGkoWr3ofqRHGBCLxkFPZ3txgbt0pIfN9eW1vFgqpNYwhzfmyAA",
            "id_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiJmN2I0MGY4NS1kYTVkLTQ0YWQtOWM5Mi03NTM2NjlhYzQxOTkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC85MzQwNDk1Yi0xNjU2LTRiZTUtOTkzMC02OWM5ZDU1ZDAwMWYvIiwiaWF0IjoxNTMzNjk0NTgxLCJuYmYiOjE1MzM2OTQ1ODEsImV4cCI6MTUzMzY5ODQ4MSwiYW1yIjpbInB3ZCJdLCJmYW1pbHlfbmFtZSI6IktvbmVydSIsImdpdmVuX25hbWUiOiJSYW1hIiwiaXBhZGRyIjoiNjYuMTkxLjY1Ljg0IiwibmFtZSI6IlJhbWEgS29uZXJ1Iiwib2lkIjoiZmIyYzIxMmMtNjk5MC00NzE4LTk5MTItOTI0MGIwZjg5NDMxIiwic3ViIjoibjVsRGdFLVF1NDRpWTA4NDQ2SE8yaGlQdEN5anE2QS1oaTI1R1Y0VUlsZyIsInRpZCI6IjkzNDA0OTViLTE2NTYtNGJlNS05OTMwLTY5YzlkNTVkMDAxZiIsInVuaXF1ZV9uYW1lIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidXBuIjoicmFtYUByYW1hanVseTIwMTgub25taWNyb3NvZnQuY29tIiwidmVyIjoiMS4wIn0."
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

