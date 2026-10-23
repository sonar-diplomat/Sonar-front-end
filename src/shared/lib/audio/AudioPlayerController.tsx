import React,{ useCallback,useEffect,useRef } from 'react';

import { Api as MusicApi } from '@entities/Music/api/api';
import { isDemoMode } from '@shared/config/data-source';
import { resolveDemoAudioUrl } from '@shared/demo/media';
import { store } from '@shared/store';
import { playNext,seekTo,setCurrentTime,setDuration,setPlaybackError,setPlaybackStatus } from '@shared/store/features/player/playerSlice';
import { useAppDispatch } from '@shared/store/hooks';

/** A single element survives route changes. Synchronous subscription keeps play() inside the visitor gesture. */
export const AudioPlayerController = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        let generation = 0;
        let sourceKey = '';
        let seekRevision = -1;
        let blobUrl: string | undefined;
        let request: AbortController | undefined;
        let playPending = false;
        let wasPlaying = false;
        let disposed = false;
        let metadataLoaded = false;
        let initialPosition = 0;
        const state = () => store.getState().player;
        const status = (value: ReturnType<typeof state>['playbackStatus']) => {
            if (!disposed && state().playbackStatus !== value) store.dispatch(setPlaybackStatus(value));
        };
        const fail = (message: string) => {
            if (disposed) return;
            audio.pause();
            store.dispatch(setPlaybackError(message));
        };
        const tryPlay = () => {
            if (disposed || !state().isPlaying || !audio.getAttribute('src') || playPending) return;
            const attempt = generation;
            playPending = true;
            audio.play().then(() => {
                if (!disposed && attempt === generation && state().isPlaying) status('playing');
            }).catch((error: unknown) => {
                if (disposed || attempt !== generation || !state().isPlaying) return;
                if (error instanceof DOMException && error.name === 'AbortError') return;
                fail(error instanceof DOMException && error.name === 'NotAllowedError'
                    ? 'Playback needs your permission. Press Play to try again.'
                    : 'Unable to play this song. Try Play again or choose another track.');
            }).finally(() => { if (attempt === generation) playPending = false; });
        };
        const onMetadata = () => {
            const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
            metadataLoaded = true;
            const restoredTime = initialPosition;
            store.dispatch(setDuration(duration));
            if (duration > 0 && restoredTime > 0) audio.currentTime = Math.min(restoredTime, duration);
            if (state().isPlaying) tryPlay();
            else status('paused');
        };
        const onTime = () => { if (metadataLoaded && Number.isFinite(audio.currentTime)) store.dispatch(setCurrentTime(audio.currentTime)); };
        const onDuration = () => store.dispatch(setDuration(Number.isFinite(audio.duration) ? audio.duration : 0));
        const onEnded = () => {
            if (state().repeatMode === 'one') {
                audio.currentTime = 0;
                store.dispatch(setCurrentTime(0));
                tryPlay();
            } else store.dispatch(playNext());
        };
        const onError = () => {
            if (audio.error?.code === 1 || !audio.getAttribute('src')) return;
            fail('This audio could not be loaded. Check the connection or choose another song.');
        };
        const onPlaying = () => status('playing');
        const onWaiting = () => { if (state().isPlaying) status('loading'); };
        const onPause = () => { if (!state().isPlaying) status('paused'); };
        audio.addEventListener('loadedmetadata', onMetadata);
        audio.addEventListener('durationchange', onDuration);
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('pause', onPause);

        const sync = () => {
            const player = state();
            const becomingPlaying = player.isPlaying && !wasPlaying;
            wasPlaying = player.isPlaying;
            audio.volume = player.volume;
            audio.setAttribute('data-volume', String(audio.volume));
            audio.muted = player.isMuted;
            const key = player.currentTrack ? `${player.currentTrack.id}:${player.playbackRevision}` : 'empty';
            if (key !== sourceKey) {
                sourceKey = key;
                initialPosition = player.currentTime;
                metadataLoaded = false;
                generation++;
                playPending = false;
                request?.abort();
                audio.pause();
                audio.removeAttribute('src');
                if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = undefined; }
                if (!player.currentTrack) { audio.load(); return; }
                const track = player.currentTrack;
                if (isDemoMode) {
                    const url = resolveDemoAudioUrl(track.id, track.lowQualityAudioFileId);
                    if (!url) { fail('No demo audio is available for this track.'); return; }
                    audio.src = url;
                    audio.load();
                } else {
                    request = new AbortController();
                    const expected = generation;
                    void MusicApi.stream(track.id, undefined, { signal: request.signal }).then(async response => {
                        if (!response.ok) throw new Error(`Audio request failed (${response.status})`);
                        const blob = await response.blob();
                        if (disposed || expected !== generation) return;
                        blobUrl = URL.createObjectURL(blob);
                        audio.src = blobUrl;
                        audio.load();
                        tryPlay();
                    }).catch(() => {
                        if (!disposed && expected === generation) fail('The audio stream is unavailable. Try another song.');
                    });
                }
            }
            if (seekRevision !== player.seekRevision) {
                seekRevision = player.seekRevision;
                if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
                    audio.currentTime = Math.min(audio.duration, Math.max(0, player.currentTime));
                }
            }
            if (player.isPlaying) {
                if (audio.error) audio.load();
                if (audio.ended && becomingPlaying) audio.currentTime = 0;
                if (audio.paused && !audio.ended) tryPlay();
            } else { audio.pause(); }
        };
        const unsubscribe = store.subscribe(sync);
        sync();
        const onVisibility = () => { if (document.visibilityState === 'hidden') onTime(); };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            disposed = true;
            generation++;
            unsubscribe();
            request?.abort();
            document.removeEventListener('visibilitychange', onVisibility);
            audio.removeEventListener('loadedmetadata', onMetadata);
            audio.removeEventListener('durationchange', onDuration);
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('pause', onPause);
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, []);
    return <audio ref={audioRef} data-sonar-audio preload="auto" style={{ display: 'none' }} />;
};

export const useAudioSeek = () => {
    const dispatch = useAppDispatch();
    return useCallback((time: number) => { dispatch(seekTo(time)); }, [dispatch]);
};
