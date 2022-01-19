import {
    AuthorizationCodeRequest, AuthenticationResult, AuthorizationUrlRequest,
    SilentFlowRequest, AccountInfo, Configuration, ConfidentialClientApplication
    , PublicClientApplication, TokenCache, ClientApplication
} from "@azure/msal-node";
import axios from "axios";
import * as actionTypes from "../../store/actions";

import { AuthConnection } from "../../interfaces/Auth/AuthConnection";
import store from "../../store/store";
import { cachePlugin } from "./CachePlugin";

const { BrowserWindow } = window.require("electron").remote;
export default class AuthProvider {


    private publicClientApplication: PublicClientApplication | null;
    private confidentialClientApplication: ConfidentialClientApplication | null;

    /**
     *
     */
    constructor() {
        this.publicClientApplication = null;
        this.confidentialClientApplication = null;
    }


    public getToken = async (connectionInfo: AuthConnection, onAuthWidowClosed?: () => any) => {

        let errorMessage = null;
        let authResponse: AuthenticationResult | null = null;
        let authWindow: any = null;
        try {
            const account = await this.getAccount(connectionInfo);


            if (connectionInfo.authType === "Client Credentials") {
                console.log("Account type is client credentials..");
                if (account) {
                    authResponse = await this.getTokenSilentConfidential(account, connectionInfo);
                }
                else {
                    authResponse = await this.getTokenByClientCredentials(connectionInfo);
                }

            }
            else {

                console.log("Account type is user credentials..");

                authWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    show: false
                });

                authWindow.on("closed", () => {
                    authWindow = null;

                    if (onAuthWidowClosed) {
                        onAuthWidowClosed();
                    }

                });

                if (account) {
                    authResponse = await this.getTokenSilentPublic(authWindow, account, connectionInfo);
                } else {

                    authResponse = await this.getTokenInteractive(authWindow, connectionInfo);

                }
            }
        }
        catch (err: any) {

            errorMessage = err.message;

            console.log("Error occurred while retrieving the token." + err);
            if (authWindow)
                authWindow.destroy();

            return errorMessage;
        }

        return authResponse || null;
    }


    public getTokenInteractive = async (authWindow: any, connectionInfo: AuthConnection) => {
        console.log("Getting token interactively..");
        const msalPublicClientApp = this.getMSALPublicClient(connectionInfo);
        const authorizationUrlrequest: AuthorizationUrlRequest = this.getAuthorizationUrlRequest(connectionInfo);
        let authorizationCodeUrl = await msalPublicClientApp.getAuthCodeUrl(authorizationUrlrequest);


        const authCode = await this.listenForAuthCode(authorizationCodeUrl, authWindow) as string;
        const authCodeRequest: AuthorizationCodeRequest = {
            ...authorizationUrlrequest,
            code: authCode,
        };

        if (authWindow) {
            console.log("Destroying auth window..");
            authWindow.destroy();
        }

        console.log("Aquiring token by code");
        return await msalPublicClientApp.acquireTokenByCode(authCodeRequest);
    }


    listenForAuthCode = async (navigateUrl: string, authWindow: any) => {

        authWindow.loadURL(navigateUrl);
        authWindow.show();
        return new Promise((resolve, reject) => {
            authWindow.webContents.on('will-redirect', (event: any, responseUrl: string) => {
                const parsedUrl = new URL(responseUrl);
                const authCode = parsedUrl.searchParams.get('code');
                if (authCode) {
                    resolve(authCode);
                }
            });
        });
    }


    getTokenSilentPublic = async (authWindow: any, account: AccountInfo, connectionInfo: AuthConnection) => {
        console.log("Getting token silently..");

        try {
            const silentFlowRequest: SilentFlowRequest = {
                account: account,
                forceRefresh: false,
                scopes: [connectionInfo.scope]
            }
            const msalClient = this.getMSALPublicClient(connectionInfo);
            return await msalClient.acquireTokenSilent(silentFlowRequest);
        } catch (error) {
            console.log("Silent token acquisition failed, acquiring token using pop up");
            return await this.getTokenInteractive(authWindow, connectionInfo);
        }
    }


    getTokenSilentConfidential = async (account: AccountInfo, connectionInfo: AuthConnection) => {
        console.log("Getting token silently confidential..");
        try {
            const silentFlowRequest: SilentFlowRequest = {
                account: account,
                forceRefresh: false,
                scopes: [connectionInfo.scope]
            }
            const msalClient = this.getMSALConfidentialClient(connectionInfo);
            return await msalClient.acquireTokenSilent(silentFlowRequest);
        } catch (error) {
            console.log("Silent token acquisition failed, acquiring token by Client Credential");
            return await this.getTokenByClientCredentials(connectionInfo);
        }
    }



    getAuthorizationUrlRequest = (connectionInfo: AuthConnection) => {
        const authorizationUrlrequest: AuthorizationUrlRequest = {
            scopes: [connectionInfo.scope],
            redirectUri: connectionInfo.replyUrl!!
        };

        return authorizationUrlrequest;
    }

    public getTokenByClientCredentials = async (connectionInfo: AuthConnection) => {

        console.log("getTokenByClientCredentials..");
        const confidentialApp = this.getMSALConfidentialClient(connectionInfo);

        const clientCredentialRequest = {
            scopes: [connectionInfo.scope],
        };


        let token = await confidentialApp.acquireTokenByClientCredential(clientCredentialRequest);
        return token;


    }

    public getMSALConfidentialClient = (connectionInfo: AuthConnection) => {

        console.log("getMSALConfidentialClient..");



        if (this.confidentialClientApplication != null)
            return this.confidentialClientApplication;


        const msalConfig: Configuration = {
            auth: {
                clientId: connectionInfo.appId,
                clientSecret: connectionInfo.clientSecret,
                authority: connectionInfo.authority
            }
        }


        if (connectionInfo.useTokenCache) {
            msalConfig.cache = {
                cachePlugin
            };

        }

        this.confidentialClientApplication = new ConfidentialClientApplication(msalConfig);


        return this.confidentialClientApplication;


    };


    public getMSALPublicClient = (connectionInfo: AuthConnection) => {




        if (this.publicClientApplication != null)
            return this.publicClientApplication;



        const msalConfig: Configuration = {
            auth: {
                clientId: connectionInfo.appId,
                authority: connectionInfo.authority
            }
        }

        if (connectionInfo.useTokenCache) {
            msalConfig.cache = {
                cachePlugin
            };
        }


        this.publicClientApplication = new PublicClientApplication(msalConfig);


        return this.publicClientApplication;


    };









    getOrgConnectionCache = (connectionInfo: AuthConnection): TokenCache => {

        try {
            if (connectionInfo.authType === "Client Credentials") {
                let confidentialApp = this.getMSALConfidentialClient(connectionInfo);
                return confidentialApp.getTokenCache();
            } else {

                let publicClientApp = this.getMSALPublicClient(connectionInfo);


                return publicClientApp.getTokenCache();
            }
        } catch (err) {
            console.log(err);
            throw err;
        }

    }
    getAccount = async (connectionInfo: AuthConnection) => {


        const cache = this.getOrgConnectionCache(connectionInfo);
        if (!cache)
            return null;


        const currentAccounts = await cache.getAllAccounts();

        if (currentAccounts === null) {
            console.log("No accounts detected");
            return null;
        }


        return currentAccounts.find(x => connectionInfo.accountId && x.homeAccountId === connectionInfo.accountId);

    }




}