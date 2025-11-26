export interface Song {
    id: string;
    title: string;
    artist: string;
    imageSrc: string;
    imageAlt?: string;
}

export interface TopSongsWidgetProps {
    songs: Song[];
    dateRange?: string;
    onSongMenuClick?: (songId: string) => void;
    className?: string;
}