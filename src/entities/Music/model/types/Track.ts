import type { VisibilityState } from '@entities/Access';
import type { Collection } from "./Collection";
import type { Artist } from '@entities/Distribution';

export interface Track {
 id: number;
 title: string;
 duration: number; // TimeSpan
 visibilityStateId: number;
 audioFileId: number;
 coverId: number;
 /*
 *
 *
 */
 visibilityState?: VisibilityState;
 audioFile?: File;
 cover?: File;
 artists?: Artist[];
 collections?: Collection[];
}