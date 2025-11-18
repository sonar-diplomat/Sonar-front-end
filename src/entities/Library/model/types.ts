/**
 * Library DTOs based on Documentation/All_DTOs.txt
 */

export interface FolderDTO {
    id: number;
    name: string;
    isProtected: boolean;
    parentFolderId?: number;
    parentFolderName?: string;
    subFolders: SubFolderDTO[];
    collections: CollectionSummaryDTO[];
}

export interface SubFolderDTO {
    id: number;
    name: string;
    isProtected: boolean;
    subFolderCount: number;
    collectionCount: number;
}

export interface CollectionSummaryDTO {
    id: number;
    name: string;
    type: string; // "Album", "Playlist", "Blend"
    coverId: number;
}

export interface CreateFolderDTO {
    name: string;
    parentFolderId?: number;
}

