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
        let latest = store.getState().player;
        const savePosition = (time: number) => {
            void apiClient.put(API_ENDPOINTS.userState.updateCurrentPosition, timeSpan(time), { bodyType: 'raw', headers: { 'Content-Type': 'text/plain' } }).then(response => { if (!response.success) showError('Playback position could not be saved.'); });
        };
        const synchronize = () => {
            const state = store.getState();
            const player = state.player;
            if (!state.auth.isAuthenticated) { target = ''; latest = player; return; }
            const collection = player.isStockCollection ? player.collectionContext?.id : undefined;
            const key = player.currentTrack ? `${player.currentTrack.id}:${collection || ''}` : '';
            if (key !== target) {
                target = key;
                if (latest.isPlaying && latest.currentTrack) savePosition(latest.currentTime);
                if (player.currentTrack) void apiClient.put(API_ENDPOINTS.userState.updateListeningTarget(player.currentTrack.id, collection ?? undefined)).then(response => { if (!response.success) showError('Listening progress could not be synchronized.'); });
            } else if (latest.isPlaying && !player.isPlaying && player.currentTrack) savePosition(player.currentTime);
            latest = player;
        };
        const unsubscribe = store.subscribe(synchronize);
        synchronize();
        const timer = setInterval(() => { const state = store.getState(); if (state.auth.isAuthenticated && state.player.isPlaying && state.player.currentTrack) savePosition(state.player.currentTime); }, 5000);
        return () => { unsubscribe(); clearInterval(timer); if (latest.isPlaying && latest.currentTrack) savePosition(latest.currentTime); };
    }, [showError]);
};
