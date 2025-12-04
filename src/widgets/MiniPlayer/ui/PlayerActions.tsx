import React from "react";
import { HeartIcon } from '@shared/ui';
import type { PlayerActionsProps } from '../model/types';
import styles from './MiniPlayer.module.css';

export const PlayerActions = ({ isLiked, onLike }: PlayerActionsProps) => {
  return (
    <div className={styles.actions}>
      <button
        onClick={onLike}
        aria-label={isLiked ? 'Unlike track' : 'Like track'}
        className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
      >
        <HeartIcon isFilled={isLiked} />
      </button>
    </div>
  );
};