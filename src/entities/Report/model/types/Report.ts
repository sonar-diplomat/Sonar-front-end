import type { User } from '@entities/User';
import type { ReportableEntityType } from './ReportableEntityType';
import type { ReportReasonType } from './ReportReasonType';
import type { Suspension } from '@entities/Access';

export interface Report {
 id: number;
 isClosed: boolean;
 entityIdentifier: number;
 reportableEntityTypeId: number;
 reporterId: number;
 /*
 *
 *
 */
 reportableEntityType?: ReportableEntityType;
 reporter?: User;
 reportReasonTypes?: ReportReasonType[];
 suspensions?: Suspension[];
}