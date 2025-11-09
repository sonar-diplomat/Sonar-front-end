export interface ReportableEntityTypeDTO {
    id: number;
    name: string;
}

export interface ReportReasonTypeDTO {
    id: number;
    name: string;
    recommendedSuspensionDuration: string;
}

export interface ReportDTO {
    id: number;
    isClosed: boolean;
    entityIdentifier: number;
    reportableEntityTypeId: number;
    reporterId: number;
    reportableEntityType?: ReportableEntityTypeDTO | null;
    reporter?: {
        id: number;
    } | null;
    reportReasonType?: ReportReasonTypeDTO[] | null;
}

export interface CreateReportDTO {
    entityIdentifier: number;
    reportableEntityTypeId: number;
    reportReasonTypeIds: number[];
}

export type ReportFilterDTO = {
    entityId?: number | null;
    typeId?: number | null;
    isClosed?: boolean | null;
    reporterId?: number | null;
};
