import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { PlayerActions } from './PlayerActions';
import type { MiniPlayerProps } from '../model/types';
import styles from './MiniPlayer.module.css';
import React from "react";
import {formatTime, getArtistNames, getCoverUrl} from "@widgets/MiniPlayer/lib/utils.ts";

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
    <div className={styles.player}>
      <div className={styles.header}>
        <div className={styles.albumCover}>
          {currentTrack && (
              <img src={getCoverUrl(currentTrack)} alt={currentTrack.title || 'Album cover'}/>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.infoHeader}>
            <div className={styles.songMeta}>
              <h2 className={styles.title}>{currentTrack?.title}</h2>
              <p className={styles.artist}>{getArtistNames(currentTrack)}</p>
            </div>
            <PlayerActions isLiked={isLiked} onLike={onLike}/>
          </div>
          <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
          />
          <div className={styles.duration}>
            <p className={styles.current}>{formatTime(currentTime)}</p>
            <p className={styles.total}>{formatTime(currentTrack?.duration as number)}</p>
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