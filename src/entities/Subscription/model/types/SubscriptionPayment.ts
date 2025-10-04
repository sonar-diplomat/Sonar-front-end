import {User} from "../User/User";
import {SubscriptionPack} from "./SubscriptionPack.ts";

export interface SubscriptionPayment {
    id: number;
    amount: number; // decimal(18,2)
    buyerId: number;
    subscriptionPackId: number;
    /*
    *
    *
    */
    buyer?: User;
    subscriptionPack?: SubscriptionPack;
}