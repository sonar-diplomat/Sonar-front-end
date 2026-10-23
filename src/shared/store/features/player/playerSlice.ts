import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

import type { TrackDTO } from '@entities/Music';

export type QueueTrack = TrackDTO & { _queueId: number };
type Context = { type: 'playlist' | 'album' | 'blend'; id: number };
export interface PlayerState {
    currentTrack: TrackDTO | null;
    pendingTrack: TrackDTO | null;
    isLoadingNextTrack: boolean;
    queue: QueueTrack[];
    customQueue: QueueTrack[];
    originalQueue: QueueTrack[];
    queueIndex: number;
    queueItemIdCounter: number;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    repeatMode: 'off' | 'one' | 'all';
    isShuffled: boolean;
    collectionContext: Context | null;
    favoriteTrackIds: number[];
    isStockCollection: boolean;
    playbackRevision: number;
    seekRevision: number;
    playbackStatus: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
    playbackError: string | null;
}
const initialState: PlayerState = {
    currentTrack: null, pendingTrack: null, isLoadingNextTrack: false,
    queue: [], customQueue: [], originalQueue: [], queueIndex: -1, queueItemIdCounter: 0,
    isPlaying: false, currentTime: 0, duration: 0, volume: 1, isMuted: false,
    repeatMode: 'off', isShuffled: false, collectionContext: null, favoriteTrackIds: [],
    isStockCollection: false, playbackRevision: 0, seekRevision: 0,
    playbackStatus: 'idle', playbackError: null,
};
const finiteTime = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0;
function selectTrack(state: PlayerState, index: number, playing = true) {
    state.queueIndex = index;
    state.currentTrack = state.queue[index] ?? null;
    state.pendingTrack = null;
    state.currentTime = 0;
    state.duration = 0;
    state.isPlaying = !!state.currentTrack && playing;
    state.isLoadingNextTrack = !!state.currentTrack;
    state.playbackStatus = state.currentTrack ? 'loading' : 'idle';
    state.playbackError = null;
    state.playbackRevision++;
}
const playerSlice = createSlice({
    name: 'player', initialState,
    reducers: {
        setCurrentTrack(state, action: PayloadAction<TrackDTO | null>) {
            state.queue = action.payload ? [{ ...action.payload, _queueId: state.queueItemIdCounter++ }] : [];
            state.originalQueue = [...state.queue];
            state.customQueue = [];
            state.collectionContext = null;
            selectTrack(state, state.queue.length ? 0 : -1, false);
        },
        setQueue(state, action: PayloadAction<{ tracks: TrackDTO[]; startIndex?: number; collectionContext?: Context }>) {
            state.queue = action.payload.tracks.map(track => ({ ...track, _queueId: state.queueItemIdCounter++ }));
            state.customQueue = [];
            state.originalQueue = [...state.queue];
            state.collectionContext = action.payload.collectionContext ?? null;
            state.isStockCollection = !!state.collectionContext;
            state.isShuffled = false;
            selectTrack(state, state.queue.length ? Math.max(0, Math.min(state.queue.length - 1, action.payload.startIndex ?? 0)) : -1);
        },
        playTrack(state, action: PayloadAction<TrackDTO>) {
            state.queue = [{ ...action.payload, _queueId: state.queueItemIdCounter++ }];
            state.customQueue = [];
            state.originalQueue = [...state.queue];
            state.collectionContext = null;
            state.isStockCollection = false;
            state.isShuffled = false;
            selectTrack(state, 0);
        },
        addToQueue(state, action: PayloadAction<TrackDTO>) {
            const track = { ...action.payload, _queueId: state.queueItemIdCounter++ };
            state.queue.push(track);
            state.customQueue.push(track);
            state.originalQueue.push(track);
            state.isStockCollection = false;
            if (!state.currentTrack) selectTrack(state, state.queue.length - 1, false);
        },
        addToQueueNext(state, action: PayloadAction<TrackDTO>) {
            const track = { ...action.payload, _queueId: state.queueItemIdCounter++ };
            state.queue.splice(state.queueIndex + 1, 0, track);
            state.customQueue.push(track);
            state.originalQueue.push(track);
            state.isStockCollection = false;
            if (!state.currentTrack) selectTrack(state, 0, false);
        },
        removeFromQueue(state, action: PayloadAction<number>) {
            const index = action.payload;
            const removed = state.queue[index];
            if (!removed) return;
            state.queue.splice(index, 1);
            state.customQueue = state.customQueue.filter(t => t._queueId !== removed._queueId);
            state.originalQueue = state.originalQueue.filter(t => t._queueId !== removed._queueId);
            if (index === state.queueIndex) selectTrack(state, Math.min(index, state.queue.length - 1), state.isPlaying);
            else if (index < state.queueIndex) state.queueIndex--;
        },
        clearQueue(state) {
            const { volume, isMuted, favoriteTrackIds } = state;
            return { ...initialState, volume, isMuted, favoriteTrackIds, playbackRevision: state.playbackRevision + 1 };
        },
        setPendingTrack(state, action: PayloadAction<TrackDTO | null>) { state.pendingTrack = action.payload; },
        confirmTrackSwitch(state) {
            if (!state.pendingTrack) return;
            let index = state.queue.findIndex(t => t.id === state.pendingTrack?.id);
            if (index < 0) {
                state.queue.push({ ...state.pendingTrack, _queueId: state.queueItemIdCounter++ });
                index = state.queue.length - 1;
            }
            selectTrack(state, index);
        },
        playNext(state) {
            if (state.queueIndex + 1 < state.queue.length) selectTrack(state, state.queueIndex + 1);
            else if (state.repeatMode === 'all' && state.queue.length) selectTrack(state, 0);
            else { state.isPlaying = false; state.playbackStatus = 'paused'; }
        },
        playPrevious(state) {
            if (state.currentTime > 3) { state.currentTime = 0; state.seekRevision++; }
            else if (state.queueIndex > 0) selectTrack(state, state.queueIndex - 1);
            else if (state.repeatMode === 'all' && state.queue.length) selectTrack(state, state.queue.length - 1);
            else { state.currentTime = 0; state.seekRevision++; }
        },
        playFromQueue(state, action: PayloadAction<number>) {
            const index = state.queue.findIndex(t => t._queueId === action.payload);
            if (index >= 0) selectTrack(state, index);
        },
        togglePlayPause(state) { if (state.currentTrack) { state.isPlaying = !state.isPlaying; state.playbackError = null; } },
        play(state) { if (state.currentTrack) { state.isPlaying = true; state.playbackError = null; } },
        pause(state) { state.isPlaying = false; },
        setCurrentTime(state, action: PayloadAction<number>) { state.currentTime = finiteTime(action.payload); },
        seekTo(state, action: PayloadAction<number>) {
            state.currentTime = state.duration > 0 ? Math.min(state.duration, finiteTime(action.payload)) : 0;
            state.seekRevision++;
        },
        setDuration(state, action: PayloadAction<number>) { state.duration = finiteTime(action.payload); },
        setVolume(state, action: PayloadAction<number>) {
            state.volume = Math.min(1, finiteTime(action.payload));
            if (state.volume > 0) state.isMuted = false;
        },
        toggleMute(state) { state.isMuted = !state.isMuted; },
        setRepeatMode(state, action: PayloadAction<PlayerState['repeatMode']>) { state.repeatMode = action.payload; },
        toggleShuffle(state) {
            if (!state.queue.length) return;
            state.isShuffled = !state.isShuffled;
            const currentId = state.queue[state.queueIndex]?._queueId;
            if (state.isShuffled) {
                state.originalQueue = [...state.queue];
                const others = state.queue.filter(t => t._queueId !== currentId);
                for (let i = others.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [others[i], others[j]] = [others[j], others[i]];
                }
                const current = state.queue.find(t => t._queueId === currentId);
                state.queue = current ? [current, ...others] : others;
            } else state.queue = [...state.originalQueue];
            state.queueIndex = state.queue.findIndex(t => t._queueId === currentId);
        },
        toggleFavoriteTrack(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.favoriteTrackIds = state.favoriteTrackIds.includes(id)
                ? state.favoriteTrackIds.filter(value => value !== id) : [...state.favoriteTrackIds, id];
        },
        setFavoriteTracks(state, action: PayloadAction<number[]>) { state.favoriteTrackIds = action.payload; },
        setPlaybackStatus(state, action: PayloadAction<PlayerState['playbackStatus']>) {
            state.playbackStatus = action.payload;
            state.isLoadingNextTrack = action.payload === 'loading';
        },
        setPlaybackError(state, action: PayloadAction<string>) {
            state.playbackError = action.payload;
            state.playbackStatus = 'error';
            state.isPlaying = false;
            state.isLoadingNextTrack = false;
        },
        restoreQueue(state, action: PayloadAction<{
            queue: TrackDTO[]; customQueue: TrackDTO[]; queueIndex: number; collectionContext: Context | null;
            currentTime?: number; isStockCollection?: boolean;
        }>) {
            state.queue = action.payload.queue.map(track => ({ ...track, _queueId: state.queueItemIdCounter++ }));
            const customIds = new Set(action.payload.customQueue.map(t => t.id));
            state.customQueue = state.queue.filter(t => customIds.has(t.id));
            state.originalQueue = [...state.queue];
            state.collectionContext = action.payload.collectionContext;
            state.isStockCollection = action.payload.isStockCollection ?? false;
            selectTrack(state, state.queue.length ? Math.max(0, Math.min(state.queue.length - 1, action.payload.queueIndex)) : -1, false);
            state.currentTime = finiteTime(action.payload.currentTime ?? 0);
        },
    },
});
export const { setCurrentTrack, setQueue, addToQueue, addToQueueNext, removeFromQueue, clearQueue,
    setPendingTrack, confirmTrackSwitch, playTrack, playNext, playPrevious, playFromQueue,
    togglePlayPause, play, pause, setCurrentTime, seekTo, setDuration, setVolume, toggleMute,
    setRepeatMode, toggleShuffle, toggleFavoriteTrack, setFavoriteTracks, restoreQueue,
    setPlaybackStatus, setPlaybackError } = playerSlice.actions;
export default playerSlice.reducer;
