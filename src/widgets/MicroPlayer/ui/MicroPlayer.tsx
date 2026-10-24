import React,{ lazy,Suspense,useState } from 'react';

import { useToggleTrackFavoriteMutation } from '@entities/Music/api/rtkApi';
import { useAudioSeek } from '@shared/lib/audio';
import { getImageUrl } from '@shared/lib/image-utils';
import { usePlayer } from '@shared/store/features/player';
import { useNotifications } from '@shared/store/notificationStore';
import { HeartIcon,LoadingImage,NextIcon,PauseIcon,PlayIcon } from '@shared/ui';
import { getArtistNames } from '@widgets/MiniPlayer/lib/utils';

import styles from './MicroPlayer.module.css';
import { MicroProgressBar } from './MicroProgressBar';
const MacroPlayer = lazy(() => import('@widgets/MacroPlayer').then(module => ({ default: module.MacroPlayer })));
export const MicroPlayer = () => {
    const [open, setOpen] = useState(false);
    const { currentTrack, isPlaying, currentTime, duration, isShuffled, togglePlayPause, playNext, playPrevious, playFromQueue, toggleShuffle, queue, queueIndex, favoriteTrackIds, toggleFavoriteTrackLocal, removeFromQueue, repeatMode, playbackError } = usePlayer();
    const seek = useAudioSeek();
    const { showError } = useNotifications();
    const [toggleFavorite, { isLoading }] = useToggleTrackFavoriteMutation();
    if (!currentTrack) return null;
    const favorite = favoriteTrackIds.includes(currentTrack.id);
    const cover = getImageUrl(currentTrack.cover?.url || currentTrack.coverId);
    const like = async () => {
        if (isLoading) return;
        toggleFavoriteTrackLocal(currentTrack.id);
        try { await toggleFavorite(currentTrack.id).unwrap(); }
        catch { toggleFavoriteTrackLocal(currentTrack.id); showError('Unable to update favorites'); }
    };
    return <>
        {playbackError && <p className={styles.playerStatus} role="alert">{playbackError}</p>}
        <div className={styles.microPlayer}>
            <div className={styles.cover}>{cover && <LoadingImage src={cover} alt={currentTrack.title} />}</div>
            <div className={styles.trackInfo}>
                <button className={styles.openPlayer} aria-label="Open full player" onClick={() => setOpen(true)}><h3 className={styles.trackTitle}>{currentTrack.title}</h3><p className={styles.artistName}>{getArtistNames(currentTrack)}</p></button>
                <MicroProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
            </div>
            <div className={styles.controls}>
                <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} className={styles.playButton}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                {(queueIndex < queue.length - 1 || repeatMode === 'all') && <button onClick={playNext} aria-label="Next track" className={styles.controlButton}><NextIcon /></button>}
                <button onClick={() => void like()} disabled={isLoading} aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'} className={styles.controlButton}><HeartIcon isFilled={favorite} /></button>
            </div>
        </div>
        {open && <Suspense fallback={<p role="status">Opening player…</p>}><MacroPlayer isOpen onClose={() => setOpen(false)} currentTrack={currentTrack} queue={queue.slice(queueIndex + 1)} isPlaying={isPlaying} currentTime={currentTime} duration={duration} isShuffled={isShuffled} onPlayPause={togglePlayPause} onNext={playNext} onPrevious={playPrevious} onSeek={seek} onShuffle={toggleShuffle} onTrackSelect={playFromQueue} onRemoveFromQueue={id => { const index = queue.findIndex(track => track._queueId === id); if (index > queueIndex) removeFromQueue(index); }} /></Suspense>}
    </>;
};
