import type { User } from '@entities/User';
import type { Track, Album } from '@entities/Music';

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