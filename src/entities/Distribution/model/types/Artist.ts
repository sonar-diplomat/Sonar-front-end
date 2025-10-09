import type { User } from '../../../User';
import type { Track } from '../../../Music';
import type { Album } from '../../../Music';

export interface Artist {
 id: number;
 userId: number;
 /*
 *
 *
 */
 user?: User;
 tracks?: Track[];
 albums?: Album[];
}