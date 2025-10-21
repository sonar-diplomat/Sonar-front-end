import type { GiftStyle } from './GiftStyle';
import type { User } from '@entities/User';
import type { SubscriptionPayment } from '@entities/Subscription';

export interface Gift {
 id: number;
 title: string;
 textContent?: string; //markdown
 giftTime: Date;
 giftStyleId: number;
 receiverId: number;
 subscriptionPaymentId: number;
 /*
 *
 *
 */
 receiver?: User;
 giftStyle?: GiftStyle;
 subscriptionPayment?: SubscriptionPayment;
}