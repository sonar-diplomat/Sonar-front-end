import React,{ useEffect,useRef,useState } from 'react';

import { getImageUrl } from '@shared/lib/image-utils';
import { usePlayer } from '@shared/store/features/player';
import type { ActionMenuContext } from '@shared/ui';
import { ActionMenu,Button,LeftArrow,LoadingImage,MoreIcon,NextIcon,PauseIcon,PlayIcon,PreviousIcon,ShuffleIcon,TrackItem } from '@shared/ui';
import { formatTime,getArtistNames } from '@widgets/MiniPlayer/lib/utils';
import { ProgressBar } from '@widgets/MiniPlayer/ui/ProgressBar';

import type { MacroPlayerProps } from '../model/types';

import styles from './MacroPlayer.module.css';

export const MacroPlayer: React.FC<MacroPlayerProps> = ({ isOpen, onClose, currentTrack, queue, isPlaying, currentTime, duration, isShuffled, onPlayPause, onNext, onPrevious, onSeek, onShuffle, onTrackSelect, onRemoveFromQueue }) => {
    const [context, setContext] = useState<ActionMenuContext | null>(null);
    const dialog = useRef<HTMLElement>(null);
    const { volume, isMuted, setVolume, toggleMute, repeatMode, setRepeatMode, queueIndex, playbackError, playbackStatus } = usePlayer();
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
        return () => { document.body.style.overflow = overflow; previous?.focus(); };
    }, [isOpen]);
    if (!isOpen) return null;
    const queueId = (context?.additionalData as { queueId?: number } | undefined)?.queueId;
    const cover = currentTrack && getImageUrl(currentTrack.cover?.url || currentTrack.coverId);
    return <div className={styles.backdrop} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <section ref={dialog} className={styles.macroPlayer} role="dialog" aria-modal="true" aria-label="Now playing"
            onKeyDown={event => {
                if ((event.target as HTMLElement).closest('[role="dialog"]') !== dialog.current) return;
                if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
                if (event.key === 'Tab') {
                    const focusable = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]') || [])];
                    const first = focusable[0]; const last = focusable[focusable.length - 1];
                    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
                }
            }}>
            <div className={styles.topBar}>
                <Button theme="dark" icon={<LeftArrow />} iconOnly aria-label="Close player" onClick={onClose} />
                <Button theme="dark" icon={<MoreIcon />} iconOnly aria-label="Song actions" disabled={!currentTrack} onClick={() => { if (currentTrack) setContext({ type: 'track', entityId: currentTrack.id, entityName: currentTrack.title }); }} />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.albumCover}>{cover ? <LoadingImage src={cover} alt={currentTrack?.title || 'Album cover'} /> : <div className={styles.placeholderCover} />}</div>
                <div className={styles.trackInfo}>
                    <div className={styles.trackTitleRow}><h2 className={styles.trackTitle}>{currentTrack?.title || 'No track playing'}</h2>
                        <button className={`${styles.shuffleButton} ${isShuffled ? styles.shuffleActive : ''}`} aria-label="Shuffle" aria-pressed={isShuffled} onClick={onShuffle} disabled={!currentTrack}><ShuffleIcon /></button>
                    </div>
                    <p className={styles.artistName}>{currentTrack && getArtistNames(currentTrack)}</p>
                    <div className={styles.progressSection}>
                        <div className={styles.timeLabels}><span>{formatTime(currentTime)}</span><span>{duration > 0 ? formatTime(duration) : '—:—'}</span></div>
                        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
                    </div>
                </div>
                <div className={styles.controls}>
                    <button className={styles.controlButton} onClick={onPrevious} disabled={!currentTrack || (queueIndex === 0 && currentTime === 0 && repeatMode !== 'all')} aria-label="Previous track"><PreviousIcon /></button>
                    <button className={styles.playButton} onClick={onPlayPause} disabled={!currentTrack} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                    <button className={styles.controlButton} onClick={onNext} disabled={!currentTrack || (!queue.length && repeatMode !== 'all')} aria-label="Next track"><NextIcon /></button>
                </div>
                <div className={styles.extraControls}>
                    <Button size="small" theme="dark" aria-label={`Repeat: ${repeatMode}`} onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}>Repeat: {repeatMode}</Button>
                    <Button size="small" theme="dark" aria-label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</Button>
                    <label className={styles.volumeLabel}>Volume <input type="range" aria-label="Volume" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} /></label>
                </div>
                {playbackError ? <p role="alert">{playbackError}</p> : playbackStatus === 'loading' && <p role="status">Loading audio…</p>}
                {currentTrack?.demoCredits && <p className={styles.credits}>Music: <a href={currentTrack.demoCredits.sourceUrl} target="_blank" rel="noreferrer">{currentTrack.demoCredits.title} — {currentTrack.demoCredits.artist}</a> · <a href={currentTrack.demoCredits.licenseUrl} target="_blank" rel="noreferrer">{currentTrack.demoCredits.license}</a></p>}
                <section className={styles.queueSection}><h3 className={styles.queueTitle}>What's next?</h3>
                    {queue.length ? <div className={styles.queueList}>{queue.map(track => <TrackItem key={track._queueId} title={track.title} artist={getArtistNames(track)} imageSrc={getImageUrl(track.cover?.url || track.coverId)} onClick={() => onTrackSelect?.(track._queueId)} onMenuClick={() => setContext({ type: 'track', entityId: track.id, entityName: track.title, additionalData: { queueId: track._queueId } })} />)}</div> : <p>Your queue ends here. Add a song using its menu.</p>}
                </section>
            </div>
        </section>
        {context && <ActionMenu isOpen context={context} onClose={() => setContext(null)} customActions={typeof queueId === 'number' ? [{ id: 'remove-from-queue', label: 'Remove from Queue', icon: <MoreIcon />, onClick: () => { onRemoveFromQueue?.(queueId!); setContext(null); }, isDanger: true }] : undefined} />}
    </div>;
};

