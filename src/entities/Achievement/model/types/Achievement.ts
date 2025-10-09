import type { AchievementCategory } from './AchievementCategory';

export interface Achievement {
 id: number;
 name: string;
 description: string;
 condition: string;
 target: string;
 reward: string;
 categoryId: number;
 /*
 *
 *
 */
 achievementCategory?: AchievementCategory;
}