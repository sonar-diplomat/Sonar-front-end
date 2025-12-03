import type { CollectionDTO } from '@entities/Collection';
import type { TrackDTO } from '@entities/Music';

export interface UserRefDTO {
    id: number;
}

export interface PlaylistDTO extends CollectionDTO {
    creatorId: number;
    creator?: UserRefDTO | null;
    contributors?: UserRefDTO[] | null;
    tracks?: TrackDTO[] | null;
}

export interface CreatePlaylistDTO {
    name: string;
    cover?: File | null; // IFormFile - опциональный файл обложки
}

export interface CursorPageDTO<T> {
    // TODO: confirm exact pagination payload
    items: T[];
    after: string | null;
    limit: number;
    hasMore: boolean;
    next?: string | null;
}
