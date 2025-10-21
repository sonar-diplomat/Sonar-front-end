import type { GiftStyle } from './GiftStyle';
import type { User } from '../../../User';
import type { SubscriptionPayment } from '../../../Subscription';

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