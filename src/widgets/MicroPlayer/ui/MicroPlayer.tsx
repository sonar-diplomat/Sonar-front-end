import React, {useMemo} from "react";
import styles from './MicroPlayer.module.css';
import { MicroProgressBar } from './MicroProgressBar';
import { PlayIcon, PauseIcon, NextIcon, HeartIcon } from '@widgets/MiniPlayer/lib/icons';
import { useToggleTrackFavorite } from '@entities/Music';
import { usePlayer } from '@shared/store/features/player';
import { useAudioSeek } from '@shared/lib/audio';

export const MicroPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
  } = usePlayer();

  const handleSeek = useAudioSeek();
  const hasTrack = currentTrack !== null;

  const { mutate: toggleFavorite, loading: togglingFavorite } = useToggleTrackFavorite();

  const coverUrl = useMemo(() =>
      currentTrack ? currentTrack.cover?.url : undefined,
    [currentTrack]
  );

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
          onClick={togglePlayPause}
          disabled={!hasTrack}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={styles.playButton}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={playNext}
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
