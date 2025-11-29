export interface Track {
    id: string;
    title: string;
    artist: string;
    imageSrc?: string;
    imageAlt?: string;
}

export interface CollectionViewProps {
    title?: string;
    tracks: Track[];
    onTrackMenuClick?: (trackId: string) => void;
    className?: string;
}