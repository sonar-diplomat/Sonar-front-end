/**
 * Artist DTOs based on Documentation/All_DTOs.txt
 */

export interface PostDTO {
    title: string;
    textContent?: string;
    attachmentIds?: number[];
    setPublicOn?: string; // ISO date string
}

