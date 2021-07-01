
export interface Connection {
    currentEnv: any;
    connectionInProcess: boolean;
    connectionError: any;
    connections: Array<ConnectionUI>;
    showNewConnectionUI: boolean;
    connectionInEditMode?: boolean | null;
    newOrgConnection: ConnectionUI;
}

export interface ConnectionUI {
    name: ConnectionElement;
    orgUrl: ConnectionElement;
    authType: ConnectionElement;
    useMSFTApp: ConnectionElement;
    applicationId: ConnectionElement;
    replyUrl: ConnectionElement;
    clientSecret: ConnectionElement;
    saveNewConnection: ConnectionElement;

    [key: string]: ConnectionElement;
}

export interface ConnectionElement {
    label: string;
    elementType: string;
    elementConfig: ConnectionElementConfig;
    isHidden: boolean;
    value?: string;
    checked?: boolean;
}

export interface ConnectionElementConfig {
    type: string;
    placeholder?: string;
    name?: string;
    options?: string[];
}


