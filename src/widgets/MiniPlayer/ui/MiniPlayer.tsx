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

  const formattedDuration = useMemo(() => {
    // Support both duration (string or number) and durationInSeconds (number)
    let trackDuration: number = duration;
    if (currentTrack?.durationInSeconds) {
      trackDuration = currentTrack.durationInSeconds;
    } else if (currentTrack?.duration) {
      // If duration is a string (like "00:01:55"), try to parse it
      if (typeof currentTrack.duration === 'string') {
        const parts = currentTrack.duration.split(':').map(Number);
        if (parts.length === 3) {
          trackDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          trackDuration = parts[0] * 60 + parts[1];
        }
      } else if (typeof currentTrack.duration === 'number') {
        trackDuration = currentTrack.duration;
      }
    }
    return formatTime(trackDuration);
  }, [currentTrack?.duration, currentTrack?.durationInSeconds, duration]);


  return (
    <div className={styles.player}>
      <div className={styles.header}>
        <div className={styles.albumCover}>
          {currentTrack && coverUrl && (
              <img src={coverUrl} alt={currentTrack.title || currentTrack.name || 'Album cover'}/>
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