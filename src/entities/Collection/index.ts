export interface VisibilityStatusDTO {
    id: number;
    name: string;
}

export interface VisibilityStateDTO {
    id: number;
    setPublicOn: string;
    statusId: number;
    status?: VisibilityStatusDTO | null;
}

export interface ImageFileDTO {
    id: number;
}

export interface CollectionDTO {
    id: number;
    name: string;
    visibilityStateId: number;
    coverId: number;
    visibilityState?: VisibilityStateDTO | null;
    cover?: ImageFileDTO | null;
}

export interface ShareLinkDTO {
    // TODO: confirm exact payload
    url: string;
    expiresAt?: string | null;
}

export type ShareQrBinary = Blob; // TODO: confirm content-type/format

export { Api } from './api/api';
export * from './model/store';
