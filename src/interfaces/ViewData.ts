
export interface EntityViewData {
    entityName: string;
    views: ViewData[];
}

export interface ViewData {
    name: string;
    id: string;
    type: ViewType;
    fetchXml: string;
}

export enum ViewType {
    SystemView = 1,
    UserView = 2
}