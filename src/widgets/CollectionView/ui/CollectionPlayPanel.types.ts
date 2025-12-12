export interface CollectionPlayPanelProps {
    onPlayClick?: () => void;
    onShuffleClick?: () => void;
    isPlaying?: boolean;
    isCurrentCollection?: boolean;
    className?: string;
}
