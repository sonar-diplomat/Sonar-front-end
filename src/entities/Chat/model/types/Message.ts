import type { Chat } from "./Chat";
import type { User } from '@entities/User';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'error';

export interface Message {
 id: number;
 textContent: string;
 replyMessageId?: number;
 chatId: number;
 senderId?: number;
 senderName?: string;
 createdAt?: string;
 status?: MessageStatus;
 replyMessage?: Message;
 chat?: Chat;
 users?: User[];
}