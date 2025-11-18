export interface AudioFileDTO {
    id: number;
    // extend if needed
}

export interface ImageFileDTO {
    id: number;
    // extend if needed
}

export interface VisibilityStateDTO {
    id: number;
    // extend if needed
}

export interface TrackDTO {
    id: number;
    // Fields from GetById response
    name?: string;
    durationInSeconds?: number;
    coverUrl?: string;
    fileUrl?: string;
    artists?: string[];
    // Fields from Update response
    title?: string;
    duration?: string | null;
    isExplicit?: boolean;
    drivingDisturbingNoises?: boolean;
    visibilityStateId?: number;
    coverId?: number;
    lowQualityAudioFileId?: number;
    mediumQualityAudioFileId?: number | null;
    highQualityAudioFileId?: number | null;
    lowQualityAudioFile?: AudioFileDTO | null;
    mediumQualityAudioFile?: AudioFileDTO | null;
    highQualityAudioFile?: AudioFileDTO | null;
    visibilityState?: VisibilityStateDTO | null;
    cover?: ImageFileDTO | null;
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

export interface UpdateTrackVisibilityDTO {
    visibilityStatusId: number;
}
