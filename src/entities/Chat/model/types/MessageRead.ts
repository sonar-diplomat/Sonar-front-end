import type { Message } from "./Message";
import type { Types } from '@entities/User';

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
 user?: Types;
}