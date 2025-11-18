import React from "react";
import styles from './MicroPlayer.module.css';
import { useProgressBar } from "@shared/lib/useProgressBar";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const MicroProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
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
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
      >
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
