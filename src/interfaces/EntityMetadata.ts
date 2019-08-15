export interface EntityMetadata {
    LogicalName: string;
    Attributes: Array<any>;
    LogicalCollectionName: string;
    SchemaName: string;
    ObjectTypeCode: number;
    PicklistAttributes: Array<PicklistMetadata>;
}


export interface PicklistMetadata {
    LogicalName: string;
    MetadataId: string;
    OptionSet: OptionSet;
}

export interface OptionSet {
    MetadataId: string;
    HasChanged?: any;
    IsCustomOptionSet: boolean;
    IsGlobal: boolean;
    IsManaged: boolean;
    Name: string;
    ExternalTypeName?: string;
    OptionSetType: string;
    IntroducedVersion: string;
    ParentOptionSetName?: any;
    Description: Description;
    DisplayName: DisplayName;
    IsCustomizable: IsCustomizable;
    Options: Option[];
}

export interface Description {
    LocalizedLabels: LocalizedLabel[];
    UserLocalizedLabel: UserLocalizedLabel;
}

export interface LocalizedLabel {
    Label: string;
    LanguageCode: number;
    IsManaged: boolean;
    MetadataId: string;
    HasChanged?: boolean;
}

export interface UserLocalizedLabel {
    Label: string;
    LanguageCode: number;
    IsManaged: boolean;
    MetadataId: string;
    HasChanged?: boolean;
}


export interface DisplayName {
    LocalizedLabels: LocalizedLabel[];
    UserLocalizedLabel: UserLocalizedLabel;
}

export interface IsCustomizable {
    Value: boolean;
    CanBeChanged: boolean;
    ManagedPropertyLogicalName: string;
}



export interface Label {
    LocalizedLabels: LocalizedLabel[];
    UserLocalizedLabel: UserLocalizedLabel;
}

export interface Option {
    Value: number;
    Color: string;
    IsManaged: boolean;
    ExternalValue: string;
    ParentValues: any[];
    MetadataId?: any;
    HasChanged?: any;
    Label: Label;
    Description: Description;
}



export interface OptionData{
    Label:string;
    Value: number;
}





