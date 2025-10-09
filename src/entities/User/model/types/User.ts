import type { UserSession } from './UserSession';
import type { UserState } from './UserState';
import type { SubscriptionPack } from '../../../Subscription';
import type { Inventory } from '../../../Inventory';
import type { AchievementProgress } from '../../../Achievement';
import type {AccessFeature, VisibilityState} from "../../../Access";
import type {Artist, License, Post} from "../../../Distribution";
import type {Settings} from "../../../ClientSettings";
import type {Chat, Message} from "../../../Chat";
import type {Collection, Track} from "../../../Music";

export interface User {
 id: number;
 firstName: string;
 lastName: string;
 dateOfBirth: string;
 email: string;
 username: string;
 biography?: string; // markdown
 publicIdentifier: string;
 passwordHash: Uint8Array; // byte[]
 passwordSalt: Uint8Array; // byte[]
 availableCurrency: number;
 registrationDate: Date;
 enabled2FA: boolean;
 googleAuthorizationKey?: string;
 avatarImageId: number;
 visibilityStateId: number;
 subscriptionPackId?: number;
 /*
 *
 *
 */
 visibilityState?: VisibilityState;
 avatarImage?: File;
 subscriptionPack?: SubscriptionPack;
 artist?: Artist; 
 inventory?: Inventory;
 userState?: UserState;
 settings?: Settings;
 userSessions?: UserSession[];
 achievementProgresses?: AchievementProgress[];
 posts?: Post[];
 accessFeatures?: AccessFeature[]; 
 messages?: Message[]; 
 chats?: Chat[]; 
 collections?: Collection[]; 
 licenses?: License[]; 
 tracks?: Track[]; 
}
