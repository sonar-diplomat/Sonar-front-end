import React from "react";
import { useProgressBar } from "@shared/lib/useProgressBar";
import styles from './MiniPlayer.module.css';
import type { ProgressBarProps } from '@widgets/MiniPlayer';

export const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const {
    progressRef,
    handleMouseDown,
    displayTime,
    progress,
  } = useProgressBar({ currentTime, duration, onSeek });

  return (
    <div className={styles.progressContainer}>
      <div
        ref={progressRef}
        className={styles.progressBar}
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        tabIndex={0}
      >
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};