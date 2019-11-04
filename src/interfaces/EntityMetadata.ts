export interface EntityMetadata {
    "@odata.context": string;
    LogicalName: string;
    Attributes: Array<AttributeMetadata>;
    LogicalCollectionName: string;
    SchemaName: string;
    ObjectTypeCode: number;
    PicklistAttributes: Array<PicklistMetadata>;
    ActivityTypeMask: number;
    AutoRouteToOwnerQueue: boolean;
    CanTriggerWorkflow: boolean;
    EntityHelpUrlEnabled: boolean;
    EntityHelpUrl?: any;
    IsDocumentManagementEnabled: boolean;
    IsOneNoteIntegrationEnabled: boolean;
    IsInteractionCentricEnabled: boolean;
    IsKnowledgeManagementEnabled: boolean;
    IsSLAEnabled: boolean;
    IsBPFEntity: boolean;
    IsDocumentRecommendationsEnabled: boolean;
    IsMSTeamsIntegrationEnabled: boolean;
    DataProviderId?: any;
    DataSourceId?: any;
    AutoCreateAccessTeams: boolean;
    IsActivity: boolean;
    IsActivityParty: boolean;
    IsAvailableOffline: boolean;
    IsChildEntity: boolean;
    IsAIRUpdated: boolean;
    IconLargeName?: any;
    IconMediumName?: any;
    IconSmallName?: any;
    IconVectorName?: any;
    IsCustomEntity: boolean;
    IsBusinessProcessEnabled: boolean;
    SyncToExternalSearchIndex: boolean;
    IsOptimisticConcurrencyEnabled: boolean;
    ChangeTrackingEnabled: boolean;
    IsImportable: boolean;
    IsIntersect: boolean;
    IsManaged: boolean;
    IsEnabledForCharts: boolean;
    IsEnabledForTrace: boolean;
    IsValidForAdvancedFind: boolean;
    DaysSinceRecordLastModified: number;
    MobileOfflineFilters: string;
    IsReadingPaneEnabled: boolean;
    IsQuickCreateEnabled: boolean;
    OwnershipType: string;
    PrimaryNameAttribute: string;
    PrimaryImageAttribute: string;
    PrimaryIdAttribute: string;
    RecurrenceBaseEntityLogicalName?: any;
    ReportViewName: string;
    IntroducedVersion: string;
    IsStateModelAware: boolean;
    EnforceStateTransitions: boolean;
    ExternalName?: any;
    EntityColor: string;
    ExternalCollectionName?: any;
    CollectionSchemaName: string;
    EntitySetName: string;
    IsEnabledForExternalChannels: boolean;
    IsPrivate: boolean;
    UsesBusinessDataLabelTable: boolean;
    IsLogicalEntity: boolean;
    HasNotes: boolean;
    HasActivities: boolean;
    HasFeedback: boolean;
    IsSolutionAware: boolean;
    MetadataId: string;
    HasChanged?: any;
    Description: Description;
    DisplayCollectionName: DisplayCollectionName;
    DisplayName: DisplayName;
    IsAuditEnabled: IsAuditEnabled;
    IsValidForQueue: IsValidForQueue;
    IsConnectionsEnabled: IsConnectionsEnabled;
    IsCustomizable: IsCustomizable;
    IsRenameable: IsRenameable;
    IsMappable: IsMappable;
    IsDuplicateDetectionEnabled: IsDuplicateDetectionEnabled;
    CanCreateAttributes: CanCreateAttributes;
    CanCreateForms: CanCreateForms;
    CanCreateViews: CanCreateViews;
    CanCreateCharts: CanCreateCharts;
    CanBeRelatedEntityInRelationship: CanBeRelatedEntityInRelationship;
    CanBePrimaryEntityInRelationship: CanBePrimaryEntityInRelationship;
    CanBeInManyToMany: CanBeInManyToMany;
    CanBeInCustomEntityAssociation: CanBeInCustomEntityAssociation;
    CanEnableSyncToExternalSearchIndex: CanEnableSyncToExternalSearchIndex;
    CanModifyAdditionalSettings: CanModifyAdditionalSettings;
    CanChangeHierarchicalRelationship: CanChangeHierarchicalRelationship;
    CanChangeTrackingBeEnabled: CanChangeTrackingBeEnabled;
    IsMailMergeEnabled: IsMailMergeEnabled;
    IsVisibleInMobile: IsVisibleInMobile;
    IsVisibleInMobileClient: IsVisibleInMobileClient;
    IsReadOnlyInMobileClient: IsReadOnlyInMobileClient;
    IsOfflineInMobileClient: IsOfflineInMobileClient;
    Privileges: Privilege[];
    OneToManyRelationships:  Relationship[];
    ManyToOneRelationships:  Relationship[];
    ManyToManyRelationships: ManyToManyRelationship[];
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




export interface AttributeMetadata {
    "@odata.type":               string;
    Targets:                     string[];
    Format:                      string;
    AttributeOf:                 any;
    AttributeType:               string;
    ColumnNumber:                number;
    DeprecatedVersion:           any;
    IntroducedVersion:           string;
    EntityLogicalName:           string;
    IsCustomAttribute:           boolean;
    IsPrimaryId:                 boolean;
    IsValidODataAttribute:       boolean;
    IsPrimaryName:               boolean;
    IsValidForCreate:            boolean;
    IsValidForRead:              boolean;
    IsValidForUpdate:            boolean;
    CanBeSecuredForRead:         boolean;
    CanBeSecuredForCreate:       boolean;
    CanBeSecuredForUpdate:       boolean;
    IsSecured:                   boolean;
    IsRetrievable:               boolean;
    IsFilterable:                boolean;
    IsSearchable:                boolean;
    IsManaged:                   boolean;
    LinkedAttributeId:           any;
    LogicalName:                 string;
    IsValidForForm:              boolean;
    IsRequiredForForm:           boolean;
    IsValidForGrid:              boolean;
    SchemaName:                  string;
    ExternalName:                any;
    IsLogical:                   boolean;
    IsDataSourceSecret:          boolean;
    InheritsFrom:                any;
    SourceType:                  any;
    AutoNumberFormat:            string;
    MetadataId:                  string;
    HasChanged?:                  boolean;
    AttributeTypeName:           AttributeTypeName;
    Description:                 Description;
    DisplayName:                 Description;
    IsAuditEnabled:              CanModifyAdditionalSettings;
    IsGlobalFilterEnabled:       CanModifyAdditionalSettings;
    IsSortableEnabled:           CanModifyAdditionalSettings;
    IsCustomizable:              CanModifyAdditionalSettings;
    IsRenameable:                CanModifyAdditionalSettings;
    IsValidForAdvancedFind:      CanModifyAdditionalSettings;
    RequiredLevel:               RequiredLevel;
    CanModifyAdditionalSettings: CanModifyAdditionalSettings;
    MinSupportedValue:           Date;
    MaxSupportedValue:           Date;
    ImeMode:                     string;
    SourceTypeMask:              number;
    FormulaDefinition:           null;   
    DateTimeBehavior:            AttributeTypeName;
    CanChangeDateTimeBehavior:   CanChangeDateTimeBehavior;
}

export interface AttributeTypeName {
    Value: string;
}

export interface CanModifyAdditionalSettings {
    Value:                      boolean;
    CanBeChanged:               boolean;
    ManagedPropertyLogicalName: string;
}

export interface Description {
    LocalizedLabels:    LocalizedLabel[];
    UserLocalizedLabel: LocalizedLabel;
}

export interface LocalizedLabel {
    Label:        string;
    LanguageCode: number;
    IsManaged:    boolean;
    MetadataId:   string;
    HasChanged?:   boolean;
}

export interface RequiredLevel {
    Value:                      string;
    CanBeChanged:               boolean;
    ManagedPropertyLogicalName: string;
}
export interface CanChangeDateTimeBehavior {
    Value:                      boolean;
    CanBeChanged:               boolean;
    ManagedPropertyLogicalName: string;
}





    export interface DisplayCollectionName {
        LocalizedLabels: LocalizedLabel[];
        UserLocalizedLabel: UserLocalizedLabel;
    }


    export interface IsAuditEnabled {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsValidForQueue {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsConnectionsEnabled {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsCustomizable {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsRenameable {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsMappable {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsDuplicateDetectionEnabled {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanCreateAttributes {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanCreateForms {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanCreateViews {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanCreateCharts {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanBeRelatedEntityInRelationship {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanBePrimaryEntityInRelationship {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanBeInManyToMany {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanBeInCustomEntityAssociation {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanEnableSyncToExternalSearchIndex {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanModifyAdditionalSettings {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanChangeHierarchicalRelationship {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface CanChangeTrackingBeEnabled {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsMailMergeEnabled {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsVisibleInMobile {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsVisibleInMobileClient {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsReadOnlyInMobileClient {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface IsOfflineInMobileClient {
        Value: boolean;
        CanBeChanged: boolean;
        ManagedPropertyLogicalName: string;
    }

    export interface Privilege {
        CanBeBasic: boolean;
        CanBeDeep: boolean;
        CanBeGlobal: boolean;
        CanBeLocal: boolean;
        CanBeEntityReference: boolean;
        CanBeParentEntityReference: boolean;
        Name: string;
        PrivilegeId: string;
        PrivilegeType: string;
    }

    export interface RootObject {
       
    }



    export interface ManyToManyRelationship {
        MetadataId:                         string;
        HasChanged:                         null;
        IsCustomRelationship:               boolean;
        IsValidForAdvancedFind:             boolean;
        SchemaName:                         string;
        SecurityTypes:                      ManyToManyRelationshipSecurityTypes;
        IsManaged:                          boolean;
        RelationshipType:                   ManyToManyRelationshipRelationshipType;
        IntroducedVersion:                  IntroducedVersion;
        Entity1LogicalName:                 string;
        Entity2LogicalName:                 string;
        IntersectEntityName:                string;
        Entity1IntersectAttribute:          string;
        Entity2IntersectAttribute:          string;
        Entity1NavigationPropertyName:      string;
        Entity2NavigationPropertyName:      string;
        IsCustomizable:                     IsCustomizable;
        Entity1AssociatedMenuConfiguration: AssociatedMenuConfiguration;
        Entity2AssociatedMenuConfiguration: AssociatedMenuConfiguration;
    }
    
    export interface AssociatedMenuConfiguration {
        Behavior:         Behavior;
        Group:            Group;
        Order:            number | null;
        IsCustomizable:   boolean;
        Icon:             any | null;
        ViewId:           string;
        AvailableOffline: boolean;
        MenuId:           null | string;
        QueryApi:         null | string;
        Label:            LabelClass;
    }
    
    export enum Behavior {
        DoNotDisplay = "DoNotDisplay",
        UseCollectionName = "UseCollectionName",
        UseLabel = "UseLabel",
    }
    
    export enum Group {
        Details = "Details",
        Marketing = "Marketing",
        Sales = "Sales",
        Service = "Service",
    }
    
 
    
    export interface LabelClass {
        LocalizedLabels:    LocalizedLabel[];
        UserLocalizedLabel: LocalizedLabel | null;
    }
    

    
    export enum LabelEnum {
        BillingAccount = "Billing Account",
        Empty = "",
        VendorContact = "Vendor Contact",
    }
    
    export enum IntroducedVersion {
        The5000 = "5.0.0.0",
        The6100 = "6.1.0.0",
        The9000 = "9.0.0.0",
    }
    
    export interface IsCustomizable {
        Value:                      boolean;
        CanBeChanged:               boolean;
        ManagedPropertyLogicalName: string;
    }
    
  
    
    export enum ManyToManyRelationshipRelationshipType {
        ManyToManyRelationship = "ManyToManyRelationship",
    }
    
    export enum ManyToManyRelationshipSecurityTypes {
        None = "None",
        ParentChild = "ParentChild",
        Pointer = "Pointer",
    }
    
    export interface Relationship {
        MetadataId:                              string;
        HasChanged:                              null;
        IsCustomRelationship:                    boolean;
        IsValidForAdvancedFind:                  boolean;
        SchemaName:                              string;
        SecurityTypes:                           ManyToOneRelationshipSecurityTypes;
        IsManaged:                               boolean;
        RelationshipType:                        ManyToOneRelationshipRelationshipType;
        IntroducedVersion:                       string;
        ReferencedAttribute:                     string;
        ReferencedEntity:                        string;
        ReferencingAttribute:                    string;
        ReferencingEntity:                       string;
        IsHierarchical:                          boolean;
        ReferencedEntityNavigationPropertyName:  string;
        ReferencingEntityNavigationPropertyName: string;
        IsCustomizable:                          IsCustomizable;
        AssociatedMenuConfiguration:             AssociatedMenuConfiguration;
        CascadeConfiguration:                    CascadeConfiguration;
    }
    
    export interface CascadeConfiguration {
        Assign:     Assign;
        Delete:     Assign;
        Merge:      Assign;
        Reparent:   Assign;
        Share:      Assign;
        Unshare:    Assign;
        RollupView: Assign;
    }
    
    export enum Assign {
        Cascade = "Cascade",
        NoCascade = "NoCascade",
        RemoveLink = "RemoveLink",
        Restrict = "Restrict",
    }
    
    export enum ManyToOneRelationshipRelationshipType {
        OneToManyRelationship = "OneToManyRelationship",
    }
    
    export enum ManyToOneRelationshipSecurityTypes {
        Append = "Append",
        None = "None",
        ParentChild = "ParentChild",
    }
    