import React, {useCallback, useMemo, useState} from "react";
import styles from './MicroPlayer.module.css';
import {MicroProgressBar} from './MicroProgressBar';
import {useToggleTrackFavoriteMutation} from '@entities/Music/api/rtkApi';
import {usePlayer} from '@shared/store/features/player';
import {useAudioSeek} from '@shared/lib/audio';
import {getArtistNames} from '@widgets/MiniPlayer/lib/utils';
import {PlayIcon, PauseIcon, NextIcon, HeartIcon} from '@shared/ui';
import {MacroPlayer} from '@widgets/MacroPlayer';
import {getImageUrlById} from '@shared/lib/image-utils';

export const MicroPlayer = () => {
    const [isMacroPlayerOpen, setIsMacroPlayerOpen] = useState(false);

    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        isShuffled,
        togglePlayPause,
        playNext,
        playPrevious,
        playFromQueue,
        toggleShuffle,
        collectionContext,
        queue,
        queueIndex,
        favoriteTrackIds,
        toggleFavoriteTrackLocal,
        removeFromQueue,
    } = usePlayer();

    const handleSeek = useAudioSeek();
    const hasTrack = currentTrack !== null;
    const hasNextTrack = collectionContext !== null && queueIndex < queue.length - 1;
    
    // Use favoriteTrackIds from store as the single source of truth
    const isFavorite = useMemo(() => {
        if (!currentTrack) return false;
        return favoriteTrackIds.includes(currentTrack.id);
    }, [currentTrack, favoriteTrackIds]);

    const [toggleFavoriteApi, {isLoading: togglingFavorite}] = useToggleTrackFavoriteMutation();

    const coverUrl = useMemo(() => {
        if (!currentTrack) return undefined;
        return currentTrack.cover?.url || getImageUrlById(currentTrack.coverId);
    }, [currentTrack]);

    const artistName = useMemo(() => {
        return currentTrack ? getArtistNames(currentTrack) : '';
    }, [currentTrack]);

    const handleToggleFavorite = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (!currentTrack || togglingFavorite) return;

        toggleFavoriteTrackLocal(currentTrack.id);

        try {
            await toggleFavoriteApi(currentTrack.id).unwrap();
        } catch (error) {
            toggleFavoriteTrackLocal(currentTrack.id);
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handlePlayPauseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        togglePlayPause();
    };

    const handleNextClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        playNext();
    };

    const handleTrackSelect = useCallback((queueId: number) => {
        playFromQueue(queueId);
    }, [playFromQueue]);

    const handleRemoveFromQueue = useCallback((queueId: number) => {
        const trackIndex = queue.findIndex(t => (t as any)._queueId === queueId);
        if (trackIndex !== -1 && trackIndex > queueIndex) {
            removeFromQueue(trackIndex);
        }
    }, [queue, queueIndex, removeFromQueue]);

    const handleMicroPlayerClick = (e: React.MouseEvent | React.TouchEvent) => {
        if ((e.target as HTMLElement).closest(`.${styles.controls}`)) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        setIsMacroPlayerOpen(true);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.dataset.mouseDownX = String(e.clientX);
        target.dataset.mouseDownY = String(e.clientY);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const mouseDownX = Number(target.dataset.mouseDownX || 0);
        const mouseDownY = Number(target.dataset.mouseDownY || 0);
        const deltaX = Math.abs(e.clientX - mouseDownX);
        const deltaY = Math.abs(e.clientY - mouseDownY);

        if (deltaX < 5 && deltaY < 5) {
            handleMicroPlayerClick(e);
        }

        delete target.dataset.mouseDownX;
        delete target.dataset.mouseDownY;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        const touch = e.touches[0];
        target.dataset.touchStartX = String(touch.clientX);
        target.dataset.touchStartY = String(touch.clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        const touch = e.changedTouches[0];
        const touchStartX = Number(target.dataset.touchStartX || 0);
        const touchStartY = Number(target.dataset.touchStartY || 0);
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);

        if (deltaX < 5 && deltaY < 5) {
            handleMicroPlayerClick(e);
        }

        delete target.dataset.touchStartX;
        delete target.dataset.touchStartY;
    };

    return (
        <>
            <div
                className={styles.microPlayer}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.cover}>
                    {currentTrack && coverUrl && (
                        <img src={coverUrl} alt={currentTrack.title || 'Album cover'}/>
                    )}
                </div>
                <div className={styles.trackInfo}>
                    <h3 className={styles.trackTitle}>
                        {currentTrack?.title || 'No track playing'}
                    </h3>
                    <p className={styles.artistName}>
                        {hasTrack ? artistName : ''}
                    </p>
                    <MicroProgressBar
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={handleSeek}
                    />
                </div>
                <div className={styles.controls}>
                    <button
                        onClick={handlePlayPauseClick}
                        disabled={!hasTrack}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className={styles.playButton}
                    >
                        {isPlaying ? <PauseIcon/> : <PlayIcon/>}
                    </button>
                    {hasNextTrack && (
                        <button
                            onClick={handleNextClick}
                            disabled={!hasTrack}
                            aria-label="Next track"
                            className={styles.controlButton}
                        >
                            <NextIcon/>
                        </button>
                    )}
                    <button
                        onClick={handleToggleFavorite}
                        disabled={!hasTrack || togglingFavorite}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        className={styles.controlButton}
                    >
                        <HeartIcon isFilled={isFavorite}/>
                    </button>
                </div>
            </div>

            <MacroPlayer
                isOpen={isMacroPlayerOpen}
                onClose={() => setIsMacroPlayerOpen(false)}
                currentTrack={currentTrack}
                queue={queue.slice(queueIndex + 1)}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                isShuffled={isShuffled}
                onPlayPause={togglePlayPause}
                onNext={playNext}
                onPrevious={playPrevious}
                onSeek={handleSeek}
                onShuffle={toggleShuffle}
                onTrackSelect={handleTrackSelect}
                onRemoveFromQueue={handleRemoveFromQueue}
            />
        </>
    );
};