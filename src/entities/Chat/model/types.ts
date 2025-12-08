/**
 * Chat DTOs based on Documentation/All_DTOs.txt
 */

export interface ChatDTO {
    name: string;
    isGroup: boolean;
    coverId: number;
    creatorId: number;
    userIds: number[];
    adminIds: number[];
}

export interface CreateChatDTO {
    name: string;
    isGroup: boolean;
    coverId: number;
    userId?: number;
}

export interface MessageReadDTO {
    readAt?: string; // ISO date string, can be null
    messageId: number;
    userId: number;
}

export interface MessageDTO {
    // Optional fields for response (when returning messages)
    id?: number;
    createdAt?: string; // ISO date string
    senderId?: number;
    
    // Required fields for creation
    textContent: string;
    replyMessageId?: number;
    
    // Read status (null when creating message, populated when returning messages)
    // Contains all read records for this message (one per user who read it)
    readBy?: MessageReadDTO[];
}

export interface ChatListItemDTO {
    id: number;
    name: string;
    isGroup: boolean;
    coverId: number;
    creatorId: number;
    userIds: number[];
    lastMessage?: {
        textContent: string;
        createdAt?: string;
    };
}

