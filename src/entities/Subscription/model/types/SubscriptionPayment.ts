import type { User } from '@entities/User';
import type { SubscriptionPack } from './SubscriptionPack';

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