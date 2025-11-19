import type { TrackDTO } from '@entities/Music';

export interface MiniPlayerProps {
  currentTrack: TrackDTO | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLiked: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onLike: () => void;
}

export interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}

export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export interface PlayerActionsProps {
  isLiked: boolean;
  onLike: () => void;
}