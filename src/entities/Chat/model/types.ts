/**
 * Chat DTOs based on Documentation/All_DTOs.txt
 */

export interface ChatDTO {
    name: string;
    isGroup: boolean;
    coverId: number;
    creatorId: number;
    userIds: number[];
}

export interface CreateChatDTO {
    name: string;
    isGroup: boolean;
    coverId: number;
    userId?: number;
}

export interface MessageDTO {
    // Optional fields for response (when returning messages)
    id?: number;
    createdAt?: string; // ISO date string
    senderId?: number;
    
    // Required fields for creation
    textContent: string;
    replyMessageId?: number;
}

