import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface UseProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function useProgressBar({ currentTime, duration, onSeek }: UseProgressBarProps) {
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
    isDraggingRef.current = true;
    setIsDragging(true);
    const time = calculateTime(e);
    setDragTime(time);
  }, [calculateTime]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const time = calculateTime(e as unknown as React.MouseEvent);
      setDragTime(time);
      onSeek(time);
    },
    [calculateTime, onSeek]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      const time = calculateTime(e as unknown as React.MouseEvent);
      setDragTime(time);
      onSeek(time);
    },
    [calculateTime, onSeek]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return {
    progressRef,
    handleMouseDown,
    displayTime,
    progress,
  };
}

