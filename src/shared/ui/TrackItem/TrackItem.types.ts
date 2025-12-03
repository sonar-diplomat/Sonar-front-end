export interface TrackItemProps {
    title: string;
    artist: string;
    imageSrc?: string;
    imageAlt?: string;
    onMenuClick?: () => void;
    className?: string;
}