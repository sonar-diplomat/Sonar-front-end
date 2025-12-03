import React from 'react';
import styles from './TrackItem.module.css';
import type { TrackItemProps } from './TrackItem.types';
import { MoreIcon } from '@shared/ui';

export const TrackItem: React.FC<TrackItemProps> = ({
    title,
    artist,
    imageSrc,
    imageAlt = '',
    onMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.trackItem,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.content}>
                <div
                    className={styles.image}
                    style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
                    role="img"
                    aria-label={imageAlt}
                />
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