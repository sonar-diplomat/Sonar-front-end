import React from 'react';
import styles from './ProfileCard.module.css';
import type { ProfileCardProps } from '@shared/ui';
import { CheckMark } from '@shared/ui';

export const ProfileCard: React.FC<ProfileCardProps> = ({
    src,
    alt = '',
    className = '',
    name,
    isVerified = false,
    stats
}) => {
    const wrapperClasses = [
        styles.imageCard,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className={styles.imageContainer}>
                <img
                    src={src}
                    alt={alt}
                    className={styles.image}
                />
            </div>
            {(name || stats) && (
                <div className={styles.overlay}>
                    {name && (
                        <div className={styles.nameContainer}>
                            <h1 className={styles.name}>{name}</h1>
                            {isVerified && (
                                <div className={styles.verifiedBadge}>
                                    <CheckMark className={styles.checkIcon} />
                                </div>
                            )}
                        </div>
                    )}
                    {stats && (
                        <div className={styles.statsContainer}>
                            <a className={styles.statItem}>
                                <span className={styles.statValue}>{stats.publicPlaylists}</span>
                                <span className={styles.statLabel}>Public playlists</span>
                            </a>
                            <a className={styles.statItem}>
                                <span className={styles.statValue}>{stats.followers}</span>
                                <span className={styles.statLabel}>Followers</span>
                            </a>
                            <a className={styles.statItem}>
                                <span className={styles.statValue}>{stats.following}</span>
                                <span className={styles.statLabel}>Following</span>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};