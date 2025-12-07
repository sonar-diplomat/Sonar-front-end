import React from 'react';
import styles from './TrackItem.module.css';
import type { TrackItemProps } from './TrackItem.types';
import { MoreIcon } from '@shared/ui';

export const TrackItem: React.FC<TrackItemProps> = ({
    title,
    artist,
    imageSrc,
    imageAlt = '',
    onClick,
    onMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.trackItem,
        onClick ? styles.clickable : '',
        className,
    ].filter(Boolean).join(' ');

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onMenuClick) {
            onMenuClick(e);
        }
    };

    return (
        <div className={wrapperClasses} onClick={onClick}>
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
                    onClick={handleMenuClick}
                    aria-label="More options"
                >
                    <MoreIcon className={styles.menuIcon} />
                </button>
            )}
        </div>
    );
};