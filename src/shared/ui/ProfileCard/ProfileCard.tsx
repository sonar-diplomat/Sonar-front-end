import React from 'react';
import styles from './ProfileCard.module.css';
import {type ProfileCardProps, VerifyIcon, LoadingImage} from '@shared/ui';
import { formatNumber } from '@shared/lib';
import { MarkdownRenderer } from '@shared/lib/markdown/MarkdownRenderer';

export const ProfileCard: React.FC<ProfileCardProps> = ({
    src,
    alt = '',
    className = '',
    variant = 'stats',
    name,
    isVerified = false,
    stats,
    monthlyListeners,
    title,
    bio,
    onFollowersClick,
    onFollowingClick,
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
                    <LoadingImage
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
                <div className={styles.overlay}>
                    <div className={styles.imageContainer}>
                        <LoadingImage
                            src={src}
                            alt={alt}
                            className={styles.image}
                        />
                        <div className={styles.gradient} />
                    </div>
                    {(isVerified || title || bio) && (
                        <div className={styles.content}>
                            {isVerified && (
                                <div className={styles.verifiedBadgeTop}>
                                    <div className={styles.verifiedIcon}>
                                        <VerifyIcon className={styles.checkIcon} />
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
                                        <MarkdownRenderer content={bio} className={styles.bioText} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={wrapperClasses}>
            <div className={styles.overlay}>
                <div className={styles.topRow}>
                    <div className={styles.imageContainer}>
                        <LoadingImage
                            src={src}
                            alt={alt}
                            className={styles.image}
                        />
                    </div>
                    {(name || stats || monthlyListeners) && (
                        <div className={styles.topContent}>
                            <div className={styles.leftContent}>
                                {name && (
                                    <div className={styles.nameContainer}>
                                        <h1 className={styles.name}>{name}</h1>
                                        {isVerified && (
                                            <div className={styles.verifiedBadge}>
                                                <VerifyIcon className={styles.checkIcon} />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {monthlyListeners !== undefined ? (
                                    <div className={styles.statsContainer}>
                                        <div className={styles.monthlyListenersContainer}>
                                            <span className={styles.monthlyListenersValue}>
                                                {formatNumber(monthlyListeners)}
                                            </span>
                                            <span className={styles.monthlyListenersLabel}>Monthly listeners</span>
                                        </div>
                                    </div>
                                ) : stats && (
                                    <div className={styles.statsContainer}>
                                        <button type="button" className={styles.statItem}>
                                            <span className={styles.statValue}>{stats.publicPlaylists}</span>
                                            <span className={styles.statLabel}>Public playlists</span>
                                        </button>
                                        <button type="button" className={styles.statItem} onClick={onFollowersClick}>
                                            <span className={styles.statValue}>{stats.followers}</span>
                                            <span className={styles.statLabel}>Followers</span>
                                        </button>
                                        <button type="button" className={styles.statItem} onClick={onFollowingClick}>
                                            <span className={styles.statValue}>{stats.following}</span>
                                            <span className={styles.statLabel}>Following</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {bio && (
                    <div className={styles.bioSection}>
                        <h3 className={styles.bioLabel}>About</h3>
                        <MarkdownRenderer content={bio} className={styles.bioText} />
                    </div>
                )}
            </div>
        </div>
    );
};