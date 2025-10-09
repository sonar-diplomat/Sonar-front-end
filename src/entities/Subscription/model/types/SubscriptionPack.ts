import type { SubscriptionFeature } from './SubscriptionFeature';

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