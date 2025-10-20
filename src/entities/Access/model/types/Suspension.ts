import type { User } from '@entities/User';
import type { Report } from '@entities/Report';

export interface Suspension {
 id: number;
 reason: string;
 dateTime: Date;
 punisherId: number;
 associatedReportedId: number;
 punisher?: User;
 associatedReport?: Report;
}