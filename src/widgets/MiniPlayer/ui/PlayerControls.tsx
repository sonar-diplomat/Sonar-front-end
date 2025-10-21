import { PlayIcon, PauseIcon, NextIcon, PreviousIcon } from '../lib/icons';
import type { PlayerControlsProps } from '../model/types';
import styles from './MiniPlayer.module.css';
import React from "react";

export const PlayerControls = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disabled = false,
}: PlayerControlsProps) => {
  return (
    <div className={styles.controls}>
      <button
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous track"
        className={styles.controlButton}
      >
        <PreviousIcon />
      </button>

      <button
        onClick={onPlayPause}
        disabled={disabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={styles.playButton}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button
        onClick={onNext}
        disabled={disabled}
        aria-label="Next track"
        className={styles.controlButton}
      >
        <NextIcon />
      </button>
    </div>
  );
};