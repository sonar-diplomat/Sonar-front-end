import type { VisibilityState} from "./VisibilityState";

export interface VisibilityStatus {
 id: number;
 name: string;
 visibilityStates?: VisibilityState[];
}