import {
    AuthorizationCodeRequest, AuthenticationResult, AuthorizationUrlRequest,
    SilentFlowRequest, AccountInfo, Configuration, ConfidentialClientApplication
    , PublicClientApplication, TokenCache
} from "@azure/msal-node";

import { AuthConnection } from "../../interfaces/Auth/AuthConnection";

import { cachePlugin } from "./CachePlugin";

const { ipcRenderer } = window.require("electron");

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


    public getToken = async (connectionInfo: AuthConnection) => {

        let authResponse: AuthenticationResult | null = null;

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



            if (account) {
                authResponse = await this.getTokenSilentPublic(account, connectionInfo);
            } else {

                authResponse = await this.getTokenInteractive(connectionInfo);

            }
        }

        return authResponse || null;
    }


    public getTokenInteractive = async (connectionInfo: AuthConnection) => {
        console.log("Getting token interactively..");
        const msalPublicClientApp = this.getMSALPublicClient(connectionInfo);
        const authorizationUrlrequest: AuthorizationUrlRequest = this.getAuthorizationUrlRequest(connectionInfo);
        let authorizationCodeUrl = await msalPublicClientApp.getAuthCodeUrl(authorizationUrlrequest);


        const authCode = await this.listenForAuthCode(authorizationCodeUrl) as string;
        const authCodeRequest: AuthorizationCodeRequest = {
            ...authorizationUrlrequest,
            code: authCode,
        };


        console.log("Aquiring token by code");
        return await msalPublicClientApp.acquireTokenByCode(authCodeRequest);
    }


    listenForAuthCode = async (navigateUrl: string) => {

        let authWindow = window.open(navigateUrl, '_blank', 'nodeIntegration=yes')

        return new Promise((resolve, _reject) => {
            ipcRenderer.on('redirectedUrl', (event, url) => {
                console.log("Url after redirect " + url);

                const parsedUrl = new URL(url);
                const authCode = parsedUrl.searchParams.get('code');
                if (authCode) {
                    authWindow?.close();
                    resolve(authCode);

                }
            });
        });
    }


    getTokenSilentPublic = async (account: AccountInfo, connectionInfo: AuthConnection) => {
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
            return await this.getTokenInteractive(connectionInfo);
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