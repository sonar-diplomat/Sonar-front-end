import type { CollectionDTO } from '@entities/Collection';

export interface DistributorDTO {
    id: number;
}

export interface AlbumArtistDTO {
    id: number;
    pseudonym: string;
    artistId: number | null;
    albumId: number;
}

export interface GenreDTO {
    id: number;
    name: string;
}

export interface MoodTagDTO {
    id: number;
    name: string;
}

export interface AlbumDTO extends CollectionDTO {
    distributorId: number;
    distributor?: DistributorDTO | null;
    albumArtists?: AlbumArtistDTO[] | null;
    genre?: GenreDTO | null;
    moodTags?: MoodTagDTO[];
}

export interface UploadAlbumDTO {
    // TODO: confirm exact shape and body mode
    genreId?: number | null;
    moodTagIds?: number[] | null;
}
