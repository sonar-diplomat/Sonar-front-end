import { useEffect } from 'react';

import { apiClient } from '@shared/api/oldBaseApi';
import { API_ENDPOINTS } from '@shared/config';
import { store } from '@shared/store';
import { useNotifications } from '@shared/store/notificationStore';
const timeSpan = (time: number) => `${Math.floor(time / 3600).toString().padStart(2, '0')}:${Math.floor(time % 3600 / 60).toString().padStart(2, '0')}:${(time % 60).toFixed(6).padStart(9, '0')}`;
/** Keep transport writes outside React render and update progress on a stable timer. */
export const usePlaybackSync = () => {
    const { showError } = useNotifications();
    useEffect(() => {
        let target = '';
        const initial = store.getState();
        let latest = initial.player;
        let scope = { version: initial.auth.sessionVersion, controller: new AbortController() };
        const ownsPlayback = (version: number) => {
            const auth = store.getState().auth;
            return auth.isAuthenticated && auth.sessionVersion === version;
        };
        const savePosition = (time: number, signal?: AbortSignal) => {
            const { version } = scope;
            if (!ownsPlayback(version)) return;
            void apiClient.put(API_ENDPOINTS.userState.updateCurrentPosition, timeSpan(time), {
                bodyType: 'raw', headers: { 'Content-Type': 'text/plain' }, signal,
            }).then(response => {
                if (!response.success && !signal?.aborted && ownsPlayback(version)) showError('Playback position could not be saved.');
            });
        };
        const synchronize = () => {
            const state = store.getState();
            const player = state.player;
            if (scope.version !== state.auth.sessionVersion) {
                scope.controller.abort();
                scope = { version: state.auth.sessionVersion, controller: new AbortController() };
                target = '';
                latest = player;
            }
            if (!state.auth.isAuthenticated) { target = ''; latest = player; return; }
            const { version, controller: { signal } } = scope;
            const collection = player.isStockCollection ? player.collectionContext?.id : undefined;
            const key = player.currentTrack ? `${player.currentTrack.id}:${collection || ''}` : '';
            if (key !== target) {
                if (target && latest.isPlaying && latest.currentTrack) savePosition(latest.currentTime, signal);
                target = key;
                if (player.currentTrack) {
                    void apiClient.put(API_ENDPOINTS.userState.updateListeningTarget(player.currentTrack.id, collection), undefined, { signal }).then(response => {
                        if (!response.success && !signal.aborted && ownsPlayback(version)) showError('Listening progress could not be synchronized.');
                    });
                }
            } else if (latest.isPlaying && !player.isPlaying && player.currentTrack) savePosition(player.currentTime, signal);
            latest = player;
        };
        const unsubscribe = store.subscribe(synchronize);
        synchronize();
        const timer = setInterval(() => {
            if (latest.isPlaying && latest.currentTrack) savePosition(latest.currentTime, scope.controller.signal);
        }, 5000);
        return () => {
            unsubscribe();
            clearInterval(timer);
            scope.controller.abort();
            if (latest.isPlaying && latest.currentTrack) savePosition(latest.currentTime);
        };
    }, [showError]);
};
