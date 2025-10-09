import type { SubscriptionPack } from './SubscriptionPack';

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