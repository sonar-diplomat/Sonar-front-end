import type { Report } from './Report';

export interface ReportableEntityType {
 id: number;
 name: string;

 reports?: Report[];
}