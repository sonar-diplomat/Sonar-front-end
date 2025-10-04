import {User} from "../User/User";
import {Suspension} from "./Suspension.ts";
import {ReportableEntityType} from "./ReportableEntityType.ts";
import {ReportReasonType} from "./ReportReasonType.ts";

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
    reportReasonType?: ReportReasonType[];
    suspensions?: Suspension[];
}