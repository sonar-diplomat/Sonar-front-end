import type { Achievement } from './Achievement';
import type { User } from '@entities/User';

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