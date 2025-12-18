export interface Song {
    id: string;
    trackId: number;
    title: string;
    artist: string;
    imageSrc: string;
    imageAlt?: string;
}

export interface TopSongsWidgetProps {
    songs: Song[];
    dateRange?: string;
    isLoading?: boolean;
    error?: boolean;
    onSongMenuClick?: (songId: string) => void;
    onRetry?: () => void;
    className?: string;
}
