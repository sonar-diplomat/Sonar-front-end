import {useState, useRef, useCallback, useEffect} from 'react';
import type { ProgressBarProps } from '@widgets/MiniPlayer';
import styles from './MiniPlayer.module.css';
import React from "react";

export const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const calculateTime = useCallback((e: React.MouseEvent | MouseEvent): number => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = (e as MouseEvent).clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  }, [duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log("MouseDown");
    isDraggingRef.current = true;
    setIsDragging(true);
    const time = calculateTime(e);
    setDragTime(time);
  }, [calculateTime]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      console.log("Handle seek");
      const time = calculateTime(e as unknown as React.MouseEvent);
      setDragTime(time);
    },
    [calculateTime]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      console.log("Mouse up");
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      const time = calculateTime(e as unknown as React.MouseEvent);
      setDragTime(time);
      onSeek(time); // Pass the final time to parent
    },
    [calculateTime, onSeek]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

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
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
          <div
            className={styles.progressThumb}
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};