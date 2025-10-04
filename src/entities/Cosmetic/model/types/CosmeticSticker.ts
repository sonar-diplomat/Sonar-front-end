import {CosmeticItem} from "./CosmeticItem.ts";

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