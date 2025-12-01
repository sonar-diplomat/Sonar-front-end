import type { Chat } from "./Chat";
import type { User } from '@entities/User';
import type { MessageReadDTO } from '../types';

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
 readBy?: MessageReadDTO[]; // Read status from API
 replyMessage?: Message;
 chat?: Chat;
 users?: User[];
}