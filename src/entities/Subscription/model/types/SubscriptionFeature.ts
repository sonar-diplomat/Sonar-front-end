import {SubscriptionPack} from "./SubscriptionPack.ts";

export interface SubscriptionFeature {
    id: number;
    name: string;
    description: string;
    price: number; // decimal(18,2)
    /*
    *
    *
    */
    subscriptionPacks?: SubscriptionPack[];
}