import type { VisibilityStatus} from "./VisibilityStatus";

export interface VisibilityState {
 id: number;
 setPublicOn: Date;
 statusId: number;
 status?: VisibilityStatus;
}