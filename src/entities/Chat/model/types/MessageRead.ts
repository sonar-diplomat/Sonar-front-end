import type { Message } from "./Message";
import type { User } from '@entities/User';

export interface MessageRead {
 id: number;
 readAt?: Date;
 messageId: number;
 userId: number;
 /*
 *
 *
 */
 message?: Message;
 user?: User;
}