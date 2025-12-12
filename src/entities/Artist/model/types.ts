/**
 * Artist DTOs and Models
 */

export interface PostDTO {
    title: string;
    textContent?: string;
    attachmentIds?: number[];
    setPublicOn?: string; // ISO date string
}

export interface AccessFeature {
    id: number;
    name: string;
}

export interface Artist {
    id: number;
    userId: number;
    artistName: string;
    user?: {
        id: number;
        userName: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        login: string;
        publicIdentifier: string;
        biography?: string;
        registrationDate: string;
        availableCurrency: number;
        avatarImageId: number;
        accessFeatures?: AccessFeature[];
    };
}

export interface Post {
    id: number;
    title: string;
    textContent: string;
    createdAt: string;
    artistId: number;
    visibilityStateId: number;
    files?: Array<{
        id: number;
        itemName: string;
        url: string;
    }>;
    visibilityState?: {
        id: number;
        statusId: number;
        setPublicOn?: string;
    };
}

