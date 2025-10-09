import type { User } from '../../../User';
import type { Report } from '../../../Report';

export interface Suspension {
 id: number;
 reason: string;
 dateTime: Date;
 punisherId: number;
 associatedReportedId: number;
 punisher?: User;
 associatedReport?: Report;
}