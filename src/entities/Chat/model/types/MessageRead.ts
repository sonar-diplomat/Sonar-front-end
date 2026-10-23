import type { User } from '@entities/User';

import type { Message } from "./Message";

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