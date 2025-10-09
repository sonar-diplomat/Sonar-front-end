import type { User } from '../../../User';
import type { CosmeticItem } from '../../../Cosmetic';

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