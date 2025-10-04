import {User} from "./User.ts";
import {UserSession} from "./UserSession.ts";
import {UserStatus} from "./UserStatus.ts";
import {Collection} from "./Collection.ts";

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