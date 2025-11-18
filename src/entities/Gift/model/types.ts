/**
 * Gift DTOs based on Documentation/All_DTOs.txt
 */

export interface GiftResponseDTO {
    id: number;
    title: string;
    textContent: string;
    giftTime: string; // ISO date string
    acceptanceDate: string; // ISO date string
    receiverName: string;
    giftStyleName: string;
    subscriptionAmount: number;
    subscriptionPackName: string;
}

export interface GiftStyleDTO {
    id: number;
    name: string;
}

export interface SendGiftDTO {
    title: string;
    textContent: string;
    giftTime: string; // ISO date string
    giftStyleId: number;
    receiverId: number;
    buyerId: number; // The sender/buyer
    subscriptionPackId: number;
    amount: number;
}

