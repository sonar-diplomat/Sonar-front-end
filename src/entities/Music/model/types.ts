export interface AudioFileDTO {
    id: number;
    url: string;
    // extend if needed
}

export interface ImageFileDTO {
    id: number;
    url: string;
    // extend if needed
}

export interface VisibilityStateDTO {
    id: number;
    // extend if needed
}

export interface GenreDTO {
    id: number;
    name: string;
}

export interface MoodTagDTO {
    id: number;
    name: string;
}

export interface TrackDTO {
    id: number;
    demoCredits?: { artist: string; title: string; sourceUrl: string; license: string; licenseUrl: string };
    title: string;
    durationInSeconds?: number;
    albumId?: number;
    albumName?: string;
    duration: string | null;
    isExplicit: boolean;
    drivingDisturbingNoises: boolean;
    visibilityStateId: number;
    coverId: number;
    lowQualityAudioFileId: number;
    mediumQualityAudioFileId: number | null;
    highQualityAudioFileId: number | null;
    lowQualityAudioFile?: AudioFileDTO | null;
    mediumQualityAudioFile?: AudioFileDTO | null;
    highQualityAudioFile?: AudioFileDTO | null;
    visibilityState?: VisibilityStateDTO | null;
    cover?: ImageFileDTO | null;
    artists?: Array<{
        id?: number;
        artistId?: number;
        artistName?: string;
        pseudonym?: string;
        user?: {
            firstName?: string;
            lastName?: string;
        };
    }>;
    isFavorite?: boolean;
    genre: GenreDTO;
    moodTags?: MoodTagDTO[];
}

export interface UpdateTrackDTO {
    title?: string | null;
    isExplicit?: boolean | null;
    drivingDisturbingNoises?: boolean | null;
    genreId?: number | null;
    moodTagIds?: number[] | null;
}

export interface UpdateTrackFileDTO {
    playbackQualityId: number;
    file: File;
}

