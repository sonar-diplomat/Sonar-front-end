export interface AccessFeatureDTO {
    id: number;
    name: string;
}

export const AccessFeatureStruct = {
    SendMessage: 'SendMessage',
    ReportContent: 'ReportContent',
    ListenContent: 'ListenContent',
    UserLogin: 'UserLogin',
    ManageUsers: 'ManageUsers',
    ManageContent: 'ManageContent',
    ManageDistributors: 'ManageDistributors',
    ManageReports: 'ManageReports',
    IamAGod: 'IamAGod',
    CreatePost: 'CreatePost',
} as const;

export type AccessFeatureKey = (typeof AccessFeatureStruct)[keyof typeof AccessFeatureStruct];
