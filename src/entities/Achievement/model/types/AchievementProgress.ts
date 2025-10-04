import {Achievement} from "./Achievement.ts";
import {User} from "../User/User";

export interface AchievementProgress {
    id: number;
    value: string;
    achievementId: number;
    userId: number;
    /*
    *
    *
    */
    achievement?: Achievement;
    user?: User;
}