import React, {useMemo} from "react";
import styles from './MicroPlayer.module.css';
import { MicroProgressBar } from './MicroProgressBar';
import { PlayIcon, PauseIcon, NextIcon, HeartIcon } from '@widgets/MiniPlayer/lib/icons';
import { useToggleTrackFavoriteMutation } from '@entities/Music/api/rtkApi';
import { usePlayer } from '@shared/store/features/player';
import { useAudioSeek } from '@shared/lib/audio';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';
import { getImageUrlById } from '@shared/lib/image-utils';

export const MicroPlayer = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        togglePlayPause,
        playNext,
        collectionContext,
        queue,
        queueIndex,
        favoriteTrackIds,
        toggleFavoriteTrackLocal,
    } = usePlayer();

    const handleSeek = useAudioSeek();
    const hasTrack = currentTrack !== null;
    const hasNextTrack = collectionContext !== null && queueIndex < queue.length - 1;
    const isFavorite = currentTrack ? favoriteTrackIds.includes(currentTrack.id) : false;

    const [toggleFavoriteApi, { isLoading: togglingFavorite }] = useToggleTrackFavoriteMutation();

    const coverUrl = useMemo(() => {
        if (!currentTrack) return undefined;
        if (currentTrack.cover?.url) {
            return currentTrack.cover.url;
        }
        if (currentTrack.coverId) {
            return getImageUrlById(currentTrack.coverId);
        }
        return undefined;
    }, [currentTrack]);

    const artistName = useMemo(() => {
        return currentTrack ? getArtistNames(currentTrack) : '';
    }, [currentTrack]);

    const handleToggleFavorite = async () => {
        if (!currentTrack || togglingFavorite) return;

        toggleFavoriteTrackLocal(currentTrack.id);

        try {
            await toggleFavoriteApi(currentTrack.id).unwrap();
        } catch (error) {
            toggleFavoriteTrackLocal(currentTrack.id);
            console.error('Failed to toggle favorite:', error);
        }
    };

    return (
        <div className={styles.microPlayer}>
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
                    onClick={togglePlayPause}
                    disabled={!hasTrack}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className={styles.playButton}
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                {hasNextTrack && (
                    <button
                        onClick={playNext}
                        disabled={!hasTrack}
                        aria-label="Next track"
                        className={styles.controlButton}
                    >
                        <NextIcon />
                    </button>
                )}
                <button
                    onClick={handleToggleFavorite}
                    disabled={!hasTrack || togglingFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className={styles.controlButton}
                >
                    <HeartIcon isFilled={isFavorite} />
                </button>
            </div>
        </div>
    );
};