export interface TrackItemProps {
    title: string;
    artist: string;
    imageSrc?: string;
    imageAlt?: string;
    onClick?: () => void;
    onMenuClick?: (e: React.MouseEvent) => void;
    className?: string;
}