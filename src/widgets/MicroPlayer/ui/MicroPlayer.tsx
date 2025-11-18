import React, {useMemo} from "react";
import styles from './MicroPlayer.module.css';
import type { MicroPlayerProps } from '../model/types';
import { MicroProgressBar } from './MicroProgressBar';
import { PlayIcon, PauseIcon, NextIcon } from '@widgets/MiniPlayer/lib/icons';

export const MicroPlayer = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onSeek,
}: MicroPlayerProps) => {
  const hasTrack = currentTrack !== null;

  const coverUrl = useMemo(() =>
      currentTrack ? currentTrack.cover?.url : undefined,
    [currentTrack]
  );

  const artistName = useMemo(() => {
    return "Artist Name"; // TODO: Extract from currentTrack when artist data is available
  }, []);

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
          onSeek={onSeek}
        />
      </div>
      <div className={styles.controls}>
        <button
          onClick={onPlayPause}
          disabled={!hasTrack}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={styles.playButton}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={onNext}
          disabled={!hasTrack}
          aria-label="Next track"
          className={styles.controlButton}
        >
          <NextIcon />
        </button>
      </div>
    </div>
  );
};

