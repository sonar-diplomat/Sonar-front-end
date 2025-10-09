import type { Distributor} from "./Distributor";

export interface DistributorSession {
 id: number;
 ipAddress: string;
 userAgent: string;
 deviceName: string;
 lastActive: Date;
 distributorId: number;
 /*
 *
 *
 */
 distributor?: Distributor;
}
