import { AccountInfo } from "@azure/msal-node";

export interface AuthConnection {
    name: string;
    orgUrl: string;
    authType: string;
    appId: string;
    replyUrl?: string;
    clientSecret?: string;
    useTokenCache?: boolean;
    scope: string;
    accessToken?:any;
    authority?:string;
    authorizationUrl?:string;
    isMSFTApp?:boolean;
    accountId?:string;
    account?: AccountInfo;
}