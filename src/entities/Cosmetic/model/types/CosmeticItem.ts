import {CosmeticItemType} from "./CosmeticItemType.ts";
import {Inventory} from "./Inventory.ts";

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