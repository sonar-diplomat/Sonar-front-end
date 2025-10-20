import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { PlayerActions } from './PlayerActions';
import type { MiniPlayerProps } from '../model/types';
import styles from './MiniPlayer.module.css';
import React from "react";

export const MiniPlayer = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  isLiked,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onLike,
}: MiniPlayerProps) => {
  const hasTrack = currentTrack !== null;

  return (
    <div className={styles.miniPlayer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.progressSection}>
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
            {currentTrack && (
              <div className={styles.trackDetails}>
                <div className={styles.trackTitle}>{currentTrack.title}</div>
                <div className={styles.artistName}>
                  {currentTrack.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                </div>
              </div>
            )}
          </div>

          <PlayerActions isLiked={isLiked} onLike={onLike} />
        </div>

        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          disabled={!hasTrack}
        />
      </div>
    </div>
  );
};