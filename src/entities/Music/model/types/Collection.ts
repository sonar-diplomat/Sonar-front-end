import type { VisibilityState } from '@entities/Access';
import type { User } from '@entities/User';
import type { Track } from "./Track";

export interface Collection {
 id: number;
 name: string;
 visibilityStateId: number;
 coverId: number;
 /*
 *
 *
 */
 visibilityState?: VisibilityState;
 cover?: File;
 users?: User[];
 tracks?: Track[];
}