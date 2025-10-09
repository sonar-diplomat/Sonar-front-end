import type { CosmeticItem } from './CosmeticItem';

export interface CosmeticSticker {
 id: number;
 x: number;
 y: number;
 cosmeticItemId: number;
 /*
 *
 *
 */
 cosmeticItem?: CosmeticItem;
}