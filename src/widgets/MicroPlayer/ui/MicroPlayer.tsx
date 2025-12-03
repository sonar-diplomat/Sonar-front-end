import React, {useMemo} from "react";
import styles from './MicroPlayer.module.css';
import { MicroProgressBar } from './MicroProgressBar';
import { PlayIcon, PauseIcon, NextIcon, HeartIcon } from '@widgets/MiniPlayer/lib/icons';
import { useToggleTrackFavoriteMutation } from '@entities/Music/api/rtkApi';
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
  const hasNextTrack = collectionContext !== null && queueIndex < queue.length - 1;
  const isFavorite = currentTrack ? favoriteTrackIds.includes(currentTrack.id) : false;

  const [toggleFavoriteApi, { isLoading: togglingFavorite }] = useToggleTrackFavoriteMutation();

  const coverUrl = useMemo(() => {
    if (!currentTrack) return undefined;
    // Используем coverId для получения URL обложки
    return getImageUrlById(currentTrack.coverId);
  }, [currentTrack]);

  const artistName = useMemo(() => {
    return currentTrack ? getArtistNames(currentTrack) : '';
  }, [currentTrack]);

  const handleToggleFavorite = async () => {
    if (!currentTrack || togglingFavorite) return;

    toggleFavoriteTrackLocal(currentTrack.id);

    try {
      await toggleFavoriteApi(currentTrack.id).unwrap();
    } catch (error) {
      toggleFavoriteTrackLocal(currentTrack.id);
      console.error('Failed to toggle favorite:', error);
    }
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
        {hasNextTrack && (
          <button
            onClick={playNext}
            disabled={!hasTrack}
            aria-label="Next track"
            className={styles.controlButton}
          >
            <NextIcon />
          </button>
        )}
        <button
          onClick={handleToggleFavorite}
          disabled={!hasTrack || togglingFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={styles.controlButton}
        >
          <HeartIcon isFilled={isFavorite} />
        </button>
      </div>
    </div>
  );
};
