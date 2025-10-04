import {SubscriptionFeature} from "./SubscriptionFeature.ts";

export interface SubscriptionPack {
    id: number;
    name: string;
    discountMultiplier: number;
    description: string;
    /*
    *
    *
    */
    subscriptionFeatures?: SubscriptionFeature[];
}