import type { TrackDTO } from '@entities/Music';

export interface MacroPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackDTO | null;
  queue: TrackDTO[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onShuffle: () => void;
  onTrackSelect?: (queueId: number) => void;
  onRemoveFromQueue?: (queueId: number) => void;
}

