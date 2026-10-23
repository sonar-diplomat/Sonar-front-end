import React from 'react';

import styles from './MicroPlayer.module.css';
export const MicroProgressBar = ({ currentTime, duration, onSeek }: { currentTime: number; duration: number; onSeek: (time: number) => void }) => {
    const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
    return <input className={styles.seekSlider} type="range" aria-label="Seek in mini player" min={0} max={max || 1} step={0.1}
        value={max ? Math.max(0, Math.min(max, currentTime)) : 0} disabled={!max}
        onChange={event => onSeek(Number(event.target.value))} />;
};
