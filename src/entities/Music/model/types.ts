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

export interface TrackDTO {
    id: number;
    title: string;
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
        user?: {
            firstName?: string;
            lastName?: string;
        };
    }>;
    isFavorite?: boolean;
}

export interface UpdateTrackDTO {
    title?: string | null;
    isExplicit?: boolean | null;
    drivingDisturbingNoises?: boolean | null;
}

export interface UpdateTrackFileDTO {
    playbackQualityId: number;
    file: File;
}

