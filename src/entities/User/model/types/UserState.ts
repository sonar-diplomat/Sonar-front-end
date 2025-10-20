import type { User } from './User';
import type { UserSession } from './UserSession';
import type { UserStatus } from './UserStatus';
import type { Collection } from '@entities/Music';

export interface UserState {
 id: number;
 track: number;
 position: number;
 userId: number;
 primarySessionId: number;
 userStatusId: number;
 collectionId: number;
 /*
 *
 *
 */
 user?: User;
 primarySession?: UserSession;
 userStatus?: UserStatus;
 collection?: Collection;
}