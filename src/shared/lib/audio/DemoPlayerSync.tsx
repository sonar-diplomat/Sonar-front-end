import { useEffect } from 'react';

import type { TrackDTO } from '@entities/Music';
import { apiClient } from '@shared/api/oldBaseApi';
import { API_ENDPOINTS } from '@shared/config';
import { store } from '@shared/store';
import { clearQueue, restoreQueue,setRepeatMode,setVolume,toggleMute } from '@shared/store/features/player/playerSlice';
import { useNotifications } from '@shared/store/notificationStore';
const KEY = 'sonar-demo:player:v1';
/** Persist IDs; resolve entity DTOs through the common transport. Never autoplays. */
export const DemoPlayerSync = () => {
    const { showError } = useNotifications();
    useEffect(() => {
        let active = true;
        let ready = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let warned = false;
        const initialRevision = store.getState().player.playbackRevision;
        const save = () => {
            timer = undefined;
            if (!ready) return;
            const player = store.getState().player;
            try { localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 1, seedVersion: 1, state: {
                ids: player.queue.map(track => track.id), index: player.queueIndex, context: player.collectionContext,
                time: player.currentTime, volume: player.volume, muted: player.isMuted, repeat: player.repeatMode,
            } })); } catch { if (!warned) { warned = true; showError('Playback cannot be saved in this browser.'); } }
        };
        const unsubscribe = store.subscribe(() => { if (ready && !timer) timer = setTimeout(save, 500); });
        void (async () => {
            try {
                const raw = localStorage.getItem(KEY);
                const stored = raw ? JSON.parse(raw) : null;
                if (stored?.schemaVersion === 1 && stored?.seedVersion === 1 && Array.isArray(stored.state?.ids)) {
                    const data = stored.state;
                    const ids: number[] = data.ids.filter((id: unknown) => typeof id === 'number' && Number.isInteger(id) && id > 0).slice(0, 500);
                    const responses = await Promise.all([...new Set(ids)].map(id => apiClient.get<TrackDTO>(API_ENDPOINTS.track.byId(id))));
                    const tracks = new Map(responses.filter(result => result.success && result.data).map(result => [result.data!.id, result.data!]));
                    if (active && store.getState().player.playbackRevision === initialRevision) {
                        const queue = ids.map(id => tracks.get(id)).filter((track): track is TrackDTO => !!track);
                        store.dispatch(restoreQueue({ queue, customQueue: [], queueIndex: Number.isInteger(data.index) ? data.index : 0, collectionContext: data.context && ['album', 'playlist', 'blend'].includes(data.context.type) && Number.isInteger(data.context.id) ? data.context : null, currentTime: Number(data.time) || 0 }));
                        store.dispatch(setVolume(typeof data.volume === 'number' ? data.volume : 1));
                        if (data.muted === true) store.dispatch(toggleMute());
                        if (['off', 'one', 'all'].includes(data.repeat)) store.dispatch(setRepeatMode(data.repeat));
                    }
                }
            } catch { /* Invalid or blocked storage starts with an empty, paused player. */ }
            finally { ready = active; }
        })();
        const onReset = () => { ready = false; store.dispatch(clearQueue()); };
        window.addEventListener('sonar-demo:reset', onReset);
        window.addEventListener('pagehide', save);
        const visibility = () => { if (document.visibilityState === 'hidden') save(); };
        document.addEventListener('visibilitychange', visibility);
        return () => {
            active = false;
            unsubscribe();
            if (timer) clearTimeout(timer);
            save();
            window.removeEventListener('sonar-demo:reset', onReset);
            window.removeEventListener('pagehide', save);
            document.removeEventListener('visibilitychange', visibility);
        };
    }, [showError]);
    return null;
};
