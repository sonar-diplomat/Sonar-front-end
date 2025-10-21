import { Achievement } from './Achievement';
import { User } from '../../../User';

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