import React, {useMemo} from "react";
import styles from './MiniPlayer.module.css';
import type { MiniPlayerProps } from '@widgets/MiniPlayer';

import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import {TrackInfo} from "@widgets/MiniPlayer/ui/TrackInfo.tsx";

import {formatTime, getCoverUrl} from "@widgets/MiniPlayer/lib/utils.ts";


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

  const coverUrl = useMemo(() =>
          currentTrack ? getCoverUrl(currentTrack) : undefined,
      [currentTrack]
  );


  const formattedCurrentTime = useMemo(() =>
          formatTime(currentTime),
      [currentTime]
  );

  const formattedDuration = useMemo(() =>
          formatTime(currentTrack?.duration ?? 0),
      [currentTrack?.duration]
  );


  return (
    <div className={styles.player}>
      <div className={styles.header}>
        <div className={styles.albumCover}>
          {currentTrack && (
              <img src={coverUrl} alt={currentTrack.title || 'Album cover'}/>
          )}
        </div>
        <div className={`${styles.info} no-select`}>
          <TrackInfo currentTrack={currentTrack} isLiked={isLiked} onLike={onLike} />
          <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
          />
          <div className={`${styles.duration} no-select`}>
            <p className={styles.current}>{formattedCurrentTime}</p>
            <p className={styles.total}>{formattedDuration}</p>
          </div>
        </div>
      </div>
      <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          disabled={!hasTrack}
      />
    </div>
  );
};