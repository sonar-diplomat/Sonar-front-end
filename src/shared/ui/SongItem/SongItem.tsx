import React from 'react';
import styles from './SongItem.module.css';
import type { SongItemProps } from '@shared/ui';
import { MoreIcon} from '@shared/ui';

export const SongItem: React.FC<SongItemProps> = ({
    rank,
    title,
    artist,
    imageSrc,
    imageAlt = '',
    onMenuClick,
    className = ''
}) => {
    const wrapperClasses = [
        styles.songItem,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.content}>
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className={styles.image}
                />
                <div className={styles.info}>
                    <p className={styles.rank}>{rank}.</p>
                    <div className={styles.textContainer}>
                        <p className={styles.title}>{title}</p>
                        <p className={styles.artist}>{artist}</p>
                    </div>
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