import React, { useState } from 'react';
import styles from './ArtistMessageCard.module.css';
import {Button, PlayIcon, LinkIcon, MoreIcon} from '@shared/ui';

export interface ArtistMessage {
    id: string;
    artistName: string;
    artistImage: string;
    title: string;
    timestamp: string;
    content: string;
    link?: {
        url: string;
        text: string;
    };
    track?: {
        title: string;
        artist: string;
        coverImage: string;
        audioUrl?: string;
    };
}

export interface ArtistMessageCardProps {
    message: ArtistMessage;
    onMenuClick?: (messageId: string) => void;
    onLinkClick?: (url: string) => void;
    onTrackPlay?: (messageId: string) => void;
}

export const ArtistMessageCard: React.FC<ArtistMessageCardProps> = ({
    message,
    onMenuClick,
    onLinkClick,
    onTrackPlay,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasLongText = message.content.length > 200;

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleMenuClick = () => {
        if (onMenuClick) {
            onMenuClick(message.id);
        }
    };

    const handleLinkClick = () => {
        if (onLinkClick && message.link) {
            onLinkClick(message.link.url);
        }
    };

    const handleTrackPlay = () => {
        if (onTrackPlay) {
            onTrackPlay(message.id);
        }
    };

    return (
        <div className={styles.card}>
            {/* Track Preview (if exists) */}
            {message.track && (
                <div className={styles.trackPreview}>
                    <img
                        src={message.track.coverImage}
                        alt={message.track.title}
                        className={styles.trackImage}
                    />
                    <div className={styles.trackOverlay}>
                        <Button
                            variant="text"
                            theme="dark"
                            size="medium"
                            icon={<PlayIcon />}
                            onClick={handleTrackPlay}
                            className={styles.playButton}
                        />
                    </div>
                </div>
            )}

            {/* Content Wrapper */}
            <div className={styles.contentWrapper}>
                {/* Message Header */}
                <div className={styles.header}>
                    <div className={styles.authorInfo}>
                        <img
                            src={message.artistImage}
                            alt={message.artistName}
                            className={styles.avatar}
                        />
                        <div className={styles.textInfo}>
                            <h3 className={styles.title}>{message.title}</h3>
                            <div className={styles.metadata}>
                                <span>{message.artistName}</span>
                                <span>{message.timestamp}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="text"
                        theme="dark"
                        size="small"
                        shape="cr-16"
                        iconOnly
                        icon={<MoreIcon/>}
                        onClick={handleMenuClick}
                    />
                </div>

                {/* Message Content */}
                <div className={styles.content}>
                    <p className={`${styles.text} ${!isExpanded && hasLongText ? styles.collapsed : ''}`}>
                        {message.content}
                    </p>
                    {hasLongText && (
                        <button onClick={handleToggleExpand} className={styles.seeMore}>
                            {isExpanded ? 'See less' : 'See more...'}
                        </button>
                    )}
                </div>

                {/* Link (if exists) */}
                {message.link && (
                    <>
                        <div className={styles.divider} />
                        <button onClick={handleLinkClick} className={styles.link}>
                            <div className={styles.linkIcon}>
                                <LinkIcon />
                            </div>
                            <span>{message.link.text}</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};