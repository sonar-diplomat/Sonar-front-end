import React from 'react';
import styles from './ProfileCard.module.css';
import type { ProfileCardProps } from '@shared/ui';
import { CheckMark } from '@shared/ui';

export const ProfileCard: React.FC<ProfileCardProps> = ({
    src,
    alt = '',
    className = '',
    variant = 'stats',
    name,
    isVerified = false,
    stats,
    title,
    bio
}) => {
    const wrapperClasses = [
        styles.imageCard,
        variant === 'bio' && styles.bioVariant,
        className,
    ].filter(Boolean).join(' ');

    if (variant === 'simple') {
        return (
            <div className={wrapperClasses}>
                <div className={styles.imageContainer}>
                    <img
                        src={src}
                        alt={alt}
                        className={styles.image}
                    />
                </div>
            </div>
        );
    }

    if (variant === 'bio') {
        return (
            <div className={wrapperClasses}>
                <div className={styles.imageContainer}>
                    <img
                        src={src}
                        alt={alt}
                        className={styles.image}
                    />
                    <div className={styles.gradient} />
                </div>
                <div className={styles.overlay}>
                    {isVerified && (
                        <div className={styles.verifiedBadgeTop}>
                            <div className={styles.verifiedIcon}>
                                <CheckMark className={styles.checkIcon} />
                            </div>
                            <p className={styles.verifiedText}>Verified profile</p>
                        </div>
                    )}
                    {(title || bio) && (
                        <div className={styles.bioContent}>
                            {title && (
                                <h1 className={styles.title}>{title}</h1>
                            )}
                            {bio && (
                                <p className={styles.bioText}>{bio}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

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