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

export interface AlbumDTO extends CollectionDTO {
    distributorId: number;
    distributor?: DistributorDTO | null;
    albumArtists?: AlbumArtistDTO[] | null;
}

export interface UploadAlbumDTO {
    // TODO: confirm exact shape and body mode
}
