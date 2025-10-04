import {User} from "../User/User";
import {CosmeticItem} from "./CosmeticItem";

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