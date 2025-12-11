import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TrackDTO } from '@entities/Music';

export type QueueTrack = TrackDTO & { _queueId: number };

export interface PlayerState {
    currentTrack: TrackDTO | null;
    pendingTrack: TrackDTO | null;
    isLoadingNextTrack: boolean;
    queue: QueueTrack[];
    customQueue: QueueTrack[];
    queueIndex: number;
    queueItemIdCounter: number;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    repeatMode: 'off' | 'one' | 'all';
    isShuffled: boolean;
    originalQueue: QueueTrack[];
    collectionContext: {
        type: 'playlist' | 'album' | 'blend' | null;
        id: number | null;
    } | null;
    favoriteTrackIds: number[];
    isStockCollection: boolean;
}

const loadFavoritesFromStorage = (): number[] => {
    try {
        const stored = localStorage.getItem('favoriteTrackIds');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
        return [];
    }
};

const saveFavoritesToStorage = (favorites: number[]) => {
    try {
        localStorage.setItem('favoriteTrackIds', JSON.stringify(favorites));
    } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
    }
};

const initialState: PlayerState = {
    currentTrack: null,
    pendingTrack: null,
    isLoadingNextTrack: false,
    queue: [],
    customQueue: [],
    queueIndex: -1,
    queueItemIdCounter: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    repeatMode: 'off',
    isShuffled: false,
    originalQueue: [],
    collectionContext: null,
    favoriteTrackIds: loadFavoritesFromStorage(),
    isStockCollection: false,
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setCurrentTrack: (state, action: PayloadAction<TrackDTO | null>) => {
            state.currentTrack = action.payload;
            state.currentTime = 0;
            
            if (action.payload) {
                const trackId = action.payload.id;
                const isFavoriteFromApi = action.payload.isFavorite;
                const isInStore = state.favoriteTrackIds.includes(trackId);
                
                if (isFavoriteFromApi !== undefined) {
                    if (isFavoriteFromApi !== isInStore) {
                        if (isFavoriteFromApi && !isInStore) {
                            state.favoriteTrackIds.push(trackId);
                            saveFavoritesToStorage(state.favoriteTrackIds);
                        } else if (!isFavoriteFromApi && isInStore) {
                            const index = state.favoriteTrackIds.indexOf(trackId);
                            if (index > -1) {
                                state.favoriteTrackIds.splice(index, 1);
                                saveFavoritesToStorage(state.favoriteTrackIds);
                            }
                        }
                    }
                    action.payload.isFavorite = state.favoriteTrackIds.includes(trackId);
                } else {
                    action.payload.isFavorite = isInStore;
                }
            }
        },

        setQueue: (state, action: PayloadAction<{ tracks: TrackDTO[]; startIndex?: number; collectionContext?: { type: 'playlist' | 'album' | 'blend'; id: number } }>) => {
            const collectionTracks = action.payload.tracks.map(track => ({
                ...track,
                _queueId: state.queueItemIdCounter++
            }));

            state.queue = [...state.customQueue, ...collectionTracks];
            state.queueIndex = state.customQueue.length + (action.payload.startIndex ?? 0);
            state.currentTrack = state.queue[state.queueIndex] || null;
            state.currentTime = 0;
            state.originalQueue = [...state.queue];
            state.collectionContext = action.payload.collectionContext ?? null;
            state.isStockCollection = !!action.payload.collectionContext && state.customQueue.length === 0;

            let favoritesChanged = false;
            action.payload.tracks.forEach(track => {
                if (track.isFavorite !== undefined) {
                    const trackId = track.id;
                    const isFavorite = track.isFavorite;
                    const index = state.favoriteTrackIds.indexOf(trackId);

                    if (isFavorite && index === -1) {
                        state.favoriteTrackIds.push(trackId);
                        favoritesChanged = true;
                    } else if (!isFavorite && index > -1) {
                        state.favoriteTrackIds.splice(index, 1);
                        favoritesChanged = true;
                    }
                }
            });

            if (favoritesChanged) {
                saveFavoritesToStorage(state.favoriteTrackIds);
            }
        },

        addToQueue: (state, action: PayloadAction<TrackDTO>) => {
            const queueTrack: QueueTrack = {
                ...action.payload,
                _queueId: state.queueItemIdCounter++
            };

            state.customQueue.push(queueTrack);

            let customTracksAfterCurrent = 0;
            for (let i = state.queueIndex + 1; i < state.queue.length; i++) {
                const track = state.queue[i];
                if (state.customQueue.slice(0, -1).some(ct => ct._queueId === track._queueId)) {
                    customTracksAfterCurrent++;
                } else {
                    break;
                }
            }

            const insertIndex = state.queueIndex + 1 + customTracksAfterCurrent;
            state.queue.splice(insertIndex, 0, queueTrack);


            state.isStockCollection = false;

            if (state.queue.length === 1) {
                state.queueIndex = 0;
                state.currentTrack = queueTrack;
            }
        },

        addToQueueNext: (state, action: PayloadAction<TrackDTO>) => {
            const insertIndex = state.queueIndex + 1;
            const queueTrack: QueueTrack = {
                ...action.payload,
                _queueId: state.queueItemIdCounter++
            };

            state.customQueue.push(queueTrack);
            state.queue.splice(insertIndex, 0, queueTrack);
            state.isStockCollection = false;
        },

        removeFromQueue: (state, action: PayloadAction<number>) => {
            const indexToRemove = action.payload;
            const trackToRemove = state.queue[indexToRemove];

            const customQueueIndex = state.customQueue.findIndex(t => t._queueId === trackToRemove?._queueId);
            if (customQueueIndex !== -1) {
                state.customQueue.splice(customQueueIndex, 1);
            }

            if (indexToRemove === state.queueIndex) {
                state.queue.splice(indexToRemove, 1);
                if (state.queue.length > 0) {
                    state.queueIndex = Math.min(state.queueIndex, state.queue.length - 1);
                    state.currentTrack = state.queue[state.queueIndex];
                } else {
                    state.queueIndex = -1;
                    state.currentTrack = null;
                }
            } else {
                state.queue.splice(indexToRemove, 1);
                if (indexToRemove < state.queueIndex) {
                    state.queueIndex--;
                }
            }
        },

        clearQueue: (state) => {
            state.queue = [];
            state.customQueue = [];
            state.queueIndex = -1;
            state.currentTrack = null;
            state.pendingTrack = null;
            state.isLoadingNextTrack = false;
            state.isPlaying = false;
            state.currentTime = 0;
            state.originalQueue = [];
            state.collectionContext = null;
            state.isStockCollection = false;
        },


        playTrack: (state, action: PayloadAction<TrackDTO>) => {
            const queueTrack: QueueTrack = {
                ...action.payload,
                _queueId: state.queueItemIdCounter++
            };

            state.queue = [queueTrack];
            state.customQueue = [];
            state.queueIndex = 0;
            state.currentTrack = queueTrack;
            state.isPlaying = true;
            state.currentTime = 0;
            state.collectionContext = null;
            state.originalQueue = [queueTrack];
            state.isStockCollection = false;

            if (action.payload.isFavorite !== undefined) {
                const trackId = action.payload.id;
                const isFavorite = action.payload.isFavorite;
                const index = state.favoriteTrackIds.indexOf(trackId);

                if (isFavorite && index === -1) {
                    state.favoriteTrackIds.push(trackId);
                    saveFavoritesToStorage(state.favoriteTrackIds);
                } else if (!isFavorite && index > -1) {
                    state.favoriteTrackIds.splice(index, 1);
                    saveFavoritesToStorage(state.favoriteTrackIds);
                }
            }
        },
        setPendingTrack: (state, action: PayloadAction<TrackDTO | null>) => {
            state.pendingTrack = action.payload;
            state.isLoadingNextTrack = action.payload !== null;
        },

        confirmTrackSwitch: (state) => {
            if (state.pendingTrack) {
                state.currentTrack = state.pendingTrack;
                state.pendingTrack = null;
                state.isLoadingNextTrack = false;
                state.isPlaying = true;
                state.currentTime = 0;

                if (state.currentTrack) {
                    const trackId = state.currentTrack.id;
                    const isFavoriteFromApi = state.currentTrack.isFavorite;
                    const isInStore = state.favoriteTrackIds.includes(trackId);
                    
                    if (isFavoriteFromApi !== undefined) {
                        if (isFavoriteFromApi !== isInStore) {
                            if (isFavoriteFromApi && !isInStore) {
                                state.favoriteTrackIds.push(trackId);
                                saveFavoritesToStorage(state.favoriteTrackIds);
                            } else if (!isFavoriteFromApi && isInStore) {
                                const index = state.favoriteTrackIds.indexOf(trackId);
                                if (index > -1) {
                                    state.favoriteTrackIds.splice(index, 1);
                                    saveFavoritesToStorage(state.favoriteTrackIds);
                                }
                            }
                        }
                        state.currentTrack.isFavorite = state.favoriteTrackIds.includes(trackId);
                    } else {
                        state.currentTrack.isFavorite = isInStore;
                    }
                }

                const existingIndex = state.queue.findIndex(t => t.id === state.currentTrack!.id);
                if (existingIndex >= 0) {
                    state.queueIndex = existingIndex;
                } else {
                    const queueTrack: QueueTrack = {
                        ...state.currentTrack,
                        _queueId: state.queueItemIdCounter++
                    };
                    state.queue.push(queueTrack);
                    state.queueIndex = state.queue.length - 1;
                }
            }
        },

        playNext: (state) => {
            if (state.repeatMode === 'one') {
                state.currentTime = 0;
                return;
            }

            const nextIndex = state.queueIndex + 1;
            if (nextIndex < state.queue.length) {
                state.queueIndex = nextIndex;
                state.currentTrack = state.queue[nextIndex];
                state.currentTime = 0;
                state.isPlaying = true;
            } else if (state.repeatMode === 'all' && state.queue.length > 0) {
                state.queueIndex = 0;
                state.currentTrack = state.queue[0];
                state.currentTime = 0;
                state.isPlaying = true;
            } else {
                state.isPlaying = false;
                state.currentTrack = null;
                state.currentTime = 0;
                state.pendingTrack = null;
                state.isLoadingNextTrack = false;
            }
        },

        playPrevious: (state) => {
            const prevIndex = state.queueIndex - 1;
            if (prevIndex >= 0) {
                state.queueIndex = prevIndex;
                state.currentTrack = state.queue[prevIndex];
                state.currentTime = 0;
                state.isPlaying = true;
            } else if (state.repeatMode === 'all' && state.queue.length > 0) {
                state.queueIndex = state.queue.length - 1;
                state.currentTrack = state.queue[state.queueIndex];
                state.currentTime = 0;
                state.isPlaying = true;
            }
        },

        playFromQueue: (state, action: PayloadAction<number>) => {
            const queueId = action.payload;
            const trackIndex = state.queue.findIndex(t => t._queueId === queueId);

            if (trackIndex !== -1) {
                if (state.collectionContext) {
                    state.queueIndex = trackIndex;
                    state.currentTrack = state.queue[trackIndex];
                    state.currentTime = 0;
                    state.isPlaying = true;
                } else {
                    state.queue = state.queue.slice(trackIndex);
                    state.queueIndex = 0;
                    state.currentTrack = state.queue[0];
                    state.currentTime = 0;
                    state.isPlaying = true;

                    if (state.isShuffled) {
                        state.originalQueue = state.originalQueue.filter(t =>
                            state.queue.some(qt => qt._queueId === t._queueId)
                        );
                    } else {
                        state.originalQueue = [...state.queue];
                    }
                }
            }
        },

        togglePlayPause: (state) => {
            state.isPlaying = !state.isPlaying;
        },

        play: (state) => {
            state.isPlaying = true;
        },

        pause: (state) => {
            state.isPlaying = false;
        },

        setCurrentTime: (state, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },

        setDuration: (state, action: PayloadAction<number>) => {
            state.duration = action.payload;
        },

        setVolume: (state, action: PayloadAction<number>) => {
            state.volume = Math.max(0, Math.min(1, action.payload));
            if (state.volume > 0) {
                state.isMuted = false;
            }
        },

        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },

        setRepeatMode: (state, action: PayloadAction<'off' | 'one' | 'all'>) => {
            state.repeatMode = action.payload;
        },

        toggleShuffle: (state) => {
            state.isShuffled = !state.isShuffled;

            if (state.isShuffled) {
                state.originalQueue = [...state.queue];

                const currentTrack = state.queue[state.queueIndex];
                const otherTracks = state.queue.filter((_, i) => i !== state.queueIndex);

                for (let i = otherTracks.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
                }

                state.queue = [currentTrack, ...otherTracks];
                state.queueIndex = 0;
            } else {
                if (state.originalQueue.length > 0) {
                    const currentTrack = state.currentTrack;
                    state.queue = [...state.originalQueue];
                    state.queueIndex = currentTrack
                        ? state.queue.findIndex(t => t.id === currentTrack.id)
                        : 0;
                }
            }
        },

        toggleFavoriteTrack: (state, action: PayloadAction<number>) => {
            const trackId = action.payload;
            const index = state.favoriteTrackIds.indexOf(trackId);
            const isNowFavorite = index === -1;
            
            if (isNowFavorite) {
                state.favoriteTrackIds.push(trackId);
            } else {
                state.favoriteTrackIds.splice(index, 1);
            }
            saveFavoritesToStorage(state.favoriteTrackIds);
            
            if (state.currentTrack && state.currentTrack.id === trackId) {
                state.currentTrack.isFavorite = isNowFavorite;
            }
            
            state.queue.forEach(track => {
                if (track.id === trackId) {
                    track.isFavorite = isNowFavorite;
                }
            });
            

            if (state.pendingTrack && state.pendingTrack.id === trackId) {
                state.pendingTrack.isFavorite = isNowFavorite;
            }
        },

        setFavoriteTracks: (state, action: PayloadAction<number[]>) => {
            state.favoriteTrackIds = action.payload;
            saveFavoritesToStorage(state.favoriteTrackIds);
        },

        restoreQueue: (state, action: PayloadAction<{
            queue: TrackDTO[];
            customQueue: TrackDTO[];
            queueIndex: number;
            collectionContext: { type: 'playlist' | 'album' | 'blend'; id: number } | null;
            currentTime?: number;
            isStockCollection?: boolean;
        }>) => {
            const { queue, customQueue, queueIndex, collectionContext, currentTime, isStockCollection } = action.payload;

            state.customQueue = customQueue.map(track => ({
                ...track,
                _queueId: state.queueItemIdCounter++
            }));

            state.queue = queue.map(track => ({
                ...track,
                _queueId: state.queueItemIdCounter++
            }));

            state.queueIndex = queueIndex;
            state.currentTrack = state.queue[queueIndex] || null;
            state.collectionContext = collectionContext;
            state.originalQueue = [...state.queue];

            state.isStockCollection = isStockCollection !== undefined
                ? isStockCollection
                : (!!collectionContext && customQueue.length === 0);

            if (currentTime !== undefined) {
                state.currentTime = currentTime;
            }
        },
    },
});

export const {
    setCurrentTrack,
    setQueue,
    addToQueue,
    addToQueueNext,
    removeFromQueue,
    clearQueue,
    setPendingTrack,
    confirmTrackSwitch,
    playTrack,
    playNext,
    playPrevious,
    playFromQueue,
    togglePlayPause,
    play,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setRepeatMode,
    toggleShuffle,
    toggleFavoriteTrack,
    setFavoriteTracks,
    restoreQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
