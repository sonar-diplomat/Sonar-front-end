import type { TrackDTO } from '@entities/Music';
import type { QueueTrack } from '@shared/store/features/player/playerSlice';

export interface MacroPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackDTO | null;
  queue: QueueTrack[];
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
