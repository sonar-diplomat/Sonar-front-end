import {GiftStyle} from "./GiftStyle.ts";
import {User} from "../User/User";
import {SubscriptionPayment} from "./SubscriptionPayment.ts";

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