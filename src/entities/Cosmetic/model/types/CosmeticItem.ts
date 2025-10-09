import type { CosmeticItemType } from './CosmeticItemType';
import type { Inventory } from '../../../Inventory';

export interface CosmeticItem {
 id: number;
 price: number;
 typeId: number;
 fileId: number;
 /*
 *
 *
 */
 type?: CosmeticItemType;
 file?: File;
 inventories?: Inventory[];
}