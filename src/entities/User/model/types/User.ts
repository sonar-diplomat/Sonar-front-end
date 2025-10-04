import {VisibilityState} from "./VisibilityState.ts";
import {AccessFeature} from "./AccessFeature.ts";
import {UserSession} from "./UserSession.ts";
import {Artist} from "./Artist.ts";
import {UserState} from "./UserState.ts";
import {Collection} from "./Collection.ts";
import {Track} from "./Track.ts";
import {Settings} from "./Settings.ts";
import {Post} from "./Post.ts";
import {Message} from "./Message.ts";
import {Chat} from "./Chat.ts";
import {License} from "./License.ts";
import {SubscriptionPack} from "./SubscriptionPack.ts";
import {Inventory} from "./Inventory.ts";
import {Achievement} from "./Achievement.ts";

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
    achievementProgresses?: Achievement[];
    posts?: Post[];
    accessFeatures?: AccessFeature[];
    messages?: Message[];
    chats?: Chat[];
    collections?: Collection[];
    licenses?: License[];
    tracks?: Track[];
}
