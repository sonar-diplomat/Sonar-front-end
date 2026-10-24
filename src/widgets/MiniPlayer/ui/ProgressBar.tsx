import React from 'react';

import type { ProgressBarProps } from '@widgets/MiniPlayer';

import styles from './MiniPlayer.module.css';
export const ProgressBar = ({ currentTime, duration, onSeek }: ProgressBarProps) => {
    const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
    return <input className={styles.seekSlider} type="range" aria-label="Seek" min={0} max={max || 1} step={0.1}
        value={max ? Math.max(0, Math.min(max, currentTime)) : 0} disabled={!max}
        onChange={event => onSeek(Number(event.target.value))} />;
};
