export interface ReportableEntityType {
    id: number;
    name: string;

    reports?: Report[];
}