import type { Chat } from "./Chat";
import type { Types } from '@entities/User';

export interface Message {
 id: number;
 textContent: string; // max length: 2000
 replyMessageId?: number;
 chatId: number;
 /*
 *
 *
 */
 replyMessage?: Message;
 chat?: Chat;
 users?: Types[];
}