import React, {useMemo} from "react";
import styles from './MicroPlayer.module.css';
import { MicroProgressBar } from './MicroProgressBar';
import { PlayIcon, PauseIcon, NextIcon, HeartIcon } from '@widgets/MiniPlayer/lib/icons';
import { useToggleTrackFavorite } from '@entities/Music';
import { usePlayer } from '@shared/store/features/player';
import { useAudioSeek } from '@shared/lib/audio';
import { getImageUrlById } from '@shared/lib/image-utils';
import type { TrackDTO } from '@entities/Music';

interface MicroPlayerProps {
  duration?: number;
  currentTime?: number;
  isPlaying?: boolean;
  currentTrack?: TrackDTO | null;
  onPlayPause?: () => void;
  onNext?: () => void;
  onSeek?: (time: number) => void;
}

export const MicroPlayer: React.FC<MicroPlayerProps> = (props) => {
  // Если пропсы переданы, используем их, иначе используем хуки
  const playerState = usePlayer();
  const audioSeek = useAudioSeek();

  const currentTrack = props.currentTrack !== undefined ? props.currentTrack : playerState.currentTrack;
  const isPlaying = props.isPlaying !== undefined ? props.isPlaying : playerState.isPlaying;
  const currentTime = props.currentTime !== undefined ? props.currentTime : playerState.currentTime;
  const duration = props.duration !== undefined ? props.duration : playerState.duration;
  const handlePlayPause = props.onPlayPause || playerState.togglePlayPause;
  const handleNext = props.onNext || playerState.playNext;
  const handleSeek = props.onSeek || audioSeek;
  const hasTrack = currentTrack !== null;

  const { mutate: toggleFavorite, loading: togglingFavorite } = useToggleTrackFavorite();

  const coverUrl = useMemo(() => {
    if (!currentTrack) return undefined;
    // Используем coverId для получения URL обложки
    return getImageUrlById(currentTrack.coverId);
  }, [currentTrack]);

  const artistName = useMemo(() => {
    return "Artist Name"; // TODO: Extract from currentTrack when artist data is available
  }, []);

  const handleToggleFavorite = () => {
    if (!currentTrack || togglingFavorite) return;
    // noinspection JSIgnoredPromiseFromCall
      toggleFavorite(currentTrack.id);
  };

  return (
    <div className={styles.microPlayer}>
      <div className={styles.cover}>
        {currentTrack && coverUrl && (
          <img src={coverUrl} alt={currentTrack.title || 'Album cover'}/>
        )}
      </div>
      <div className={styles.trackInfo}>
        <h3 className={styles.trackTitle}>
          {currentTrack?.title || 'No track playing'}
        </h3>
        <p className={styles.artistName}>
          {hasTrack ? artistName : ''}
        </p>
        <MicroProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      </div>
      <div className={styles.controls}>
        <button
          onClick={handlePlayPause}
          disabled={!hasTrack}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={styles.playButton}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={handleNext}
          disabled={!hasTrack}
          aria-label="Next track"
          className={styles.controlButton}
        >
          <NextIcon />
        </button>
        <button
          onClick={handleToggleFavorite}
          disabled={!hasTrack || togglingFavorite}
          aria-label="Toggle favorite"
          className={styles.controlButton}
        >
          <HeartIcon />
        </button>
      </div>
    </div>
  );
};
