export interface SongItemProps {
    rank: number;
    title: string;
    artist: string;
    imageSrc: string;
    imageAlt?: string;
    onMenuClick?: () => void;
    onClick?: () => void;
    className?: string;
}