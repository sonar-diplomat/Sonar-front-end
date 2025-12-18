import React from 'react';
import styles from './SongItem.module.css';
import type { SongItemProps } from '@shared/ui';
import { MoreIcon, LoadingImage } from '@shared/ui';

export const SongItem: React.FC<SongItemProps> = ({
    rank,
    title,
    artist,
    imageSrc,
    imageAlt = '',
    onMenuClick,
    onClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.songItem,
        onClick ? styles.clickable : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses} onClick={onClick}>
            <div className={styles.content}>
                <p className={styles.rank}>{rank}.</p>
                <div className={styles.imageWrapper}>
                    <LoadingImage
                        src={imageSrc}
                        alt={imageAlt}
                    />
                </div>
                <div className={styles.textContainer}>
                    <p className={styles.title}>{title}</p>
                    <p className={styles.artist}>{artist}</p>
                </div>
            </div>
            {onMenuClick && (
                <button
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="More options"
                >
                    <MoreIcon className={styles.menuIcon} />
                </button>
            )}
        </div>
    );
};