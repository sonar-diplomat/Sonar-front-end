import React, { useMemo, useEffect, useCallback, useState } from 'react';
import styles from './MacroPlayer.module.css';
import type { MacroPlayerProps } from '../model/types';
import { Button, LeftArrow, MoreIcon, HeartIcon, PlayIcon, PauseIcon, NextIcon, PreviousIcon, TrackItem, ActionMenu } from '@shared/ui';
import type { ActionMenuContext } from '@shared/ui';
import { ProgressBar } from '@widgets/MiniPlayer/ui/ProgressBar';
import { formatTime, getArtistNames } from '@widgets/MiniPlayer/lib/utils';

export const MacroPlayer: React.FC<MacroPlayerProps> = ({isOpen, onClose, currentTrack, queue, isPlaying, currentTime, duration, isLiked, onPlayPause, onNext, onPrevious, onSeek, onLike, onTrackSelect}) => {
    const hasTrack = currentTrack !== null;
    const [actionMenuContext, setActionMenuContext] = useState<ActionMenuContext | null>(null);

    const coverUrl = useMemo(() =>
            currentTrack ? currentTrack.cover?.url : undefined,
        [currentTrack]
    );

    const artistName = useMemo(() => {
        return currentTrack ? getArtistNames(currentTrack) : '';
    }, [currentTrack]);

    const formattedCurrentTime = useMemo(() =>
            formatTime(currentTime),
        [currentTime]
    );

    const formattedDuration = useMemo(() =>
            formatTime(duration),
        [duration]
    );

    const canGoNext = useMemo(() => queue.length > 0, [queue]);
    const canGoPrevious = useMemo(() => queue.length > 0, [queue]);

    const handleOpenTrackMenu = useCallback(() => {
        if (!currentTrack) return;
        setActionMenuContext({
            type: 'track',
            entityId: currentTrack.id,
            entityName: currentTrack.title,
        });
    }, [currentTrack]);

    const handleOpenQueueItemMenu = useCallback((track: typeof queue[0], e: React.MouseEvent) => {
        e.stopPropagation();
        setActionMenuContext({
            type: 'track',
            entityId: track.id,
            entityName: track.title,
        });
    }, []);

    const handleQueueItemClick = useCallback((track: typeof queue[0]) => {
        // Pass the _queueId to properly identify which instance of the track to play
        if (onTrackSelect && '_queueId' in track) {
            onTrackSelect((track as any)._queueId);
        }
    }, [onTrackSelect]);

    const handleCloseActionMenu = useCallback(() => {
        setActionMenuContext(null);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.macroPlayer}>
                <div className={styles.topBar}>
                    <Button
                        variant="filled"
                        theme="dark"
                        size="medium"
                        shape="cr-16"
                        icon={<LeftArrow />}
                        onClick={onClose}
                        iconOnly
                    />
                    <Button
                        variant="filled"
                        theme="dark"
                        size="medium"
                        shape="cr-16"
                        icon={<MoreIcon />}
                        onClick={handleOpenTrackMenu}
                        iconOnly
                        disabled={!hasTrack}
                    />
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.albumCover}>
                        {coverUrl ? (
                            <img src={coverUrl} alt={currentTrack?.title || 'Album cover'} />
                        ) : (
                            <div className={styles.placeholderCover} />
                        )}
                    </div>

                    <div className={styles.trackInfo}>
                        <div className={styles.trackTitleRow}>
                            <h2 className={styles.trackTitle}>
                                {currentTrack?.title || 'No track playing'}
                            </h2>
                            <button
                                onClick={() => onLike()}
                                disabled={!hasTrack}
                                aria-label={isLiked ? 'Unlike track' : 'Like track'}
                                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                            >
                                <HeartIcon isFilled={isLiked} />
                            </button>
                        </div>
                        <p className={styles.artistName}>
                            {hasTrack ? artistName : ''}
                        </p>
                    </div>

                    <div className={styles.progressSection}>
                        <div className={styles.timeLabels}>
                            <span className={styles.timeLabel}>{formattedCurrentTime}</span>
                            <span className={styles.timeLabel}>{formattedDuration}</span>
                        </div>
                        <ProgressBar
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={onSeek}
                        />
                    </div>

                    <div className={styles.controls}>
                        <button
                            onClick={onPrevious}
                            disabled={!hasTrack || !canGoPrevious}
                            aria-label="Previous track"
                            className={styles.controlButton}
                        >
                            <PreviousIcon />
                        </button>

                        <button
                            onClick={onPlayPause}
                            disabled={!hasTrack}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            className={styles.playButton}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>

                        <button
                            onClick={onNext}
                            disabled={!hasTrack || !canGoNext}
                            aria-label="Next track"
                            className={styles.controlButton}
                        >
                            <NextIcon />
                        </button>
                    </div>

                    {queue.length > 0 && (
                        <div className={styles.queueSection}>
                            <h3 className={styles.queueTitle}>What's next?</h3>
                            <div className={styles.queueList}>
                                {queue.map((track) => (
                                    <TrackItem
                                        key={(track as any)._queueId ?? `${track.id}-${Math.random()}`}
                                        title={track.title}
                                        artist={getArtistNames(track)}
                                        imageSrc={track.cover?.url}
                                        imageAlt={track.title}
                                        onClick={() => handleQueueItemClick(track)}
                                        onMenuClick={(e) => handleOpenQueueItemMenu(track, e)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {actionMenuContext && (
                <ActionMenu
                    isOpen={true}
                    onClose={handleCloseActionMenu}
                    context={actionMenuContext}
                />
            )}
        </div>
    );
};

