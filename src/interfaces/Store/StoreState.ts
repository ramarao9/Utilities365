import AuthProvider from "../../helpers/Auth/AuthHelper";
import { SystemForm } from "../Entities/SystemForm";
import { UserInfo } from "../UserInfo";

export interface StoreState {
    tokenData?: any;
    crmUsers?: any[];
    currentUserId?: string | null;
    entities?: any[];
    entitiesAttributeCollection?: any[];
    currentUser?: UserInfo | null;
    apps?: any[];
    currentConnection: any,
    currentMSALPublicClient?: any,
    currentMSALConfidentialClient?: any,
    authProvider: AuthProvider,
    systemForms: SystemForm[]
}


