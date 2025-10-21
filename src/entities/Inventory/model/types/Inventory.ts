import type { User } from '@entities/User';
import type { CosmeticItem } from '@entities/Cosmetic';

export interface Inventory {
 id: number;
 userId: number;
 /*
 *
 *
 */
 user?: User;
 cosmeticItems?: CosmeticItem[];
}