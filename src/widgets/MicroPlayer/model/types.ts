import type { TrackDTO } from '@entities/Music';

export interface MicroPlayerProps {
  currentTrack: TrackDTO | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
}
