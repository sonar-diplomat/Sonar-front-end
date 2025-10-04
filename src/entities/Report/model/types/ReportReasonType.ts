export interface ReportReasonType {
    id: number;
    name: string;
    recommendedSuspensionDuration: number; // TimeSpan
    reports?: Report[];
}