import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TrackDTO } from '@entities/Music';

export interface PlayerState {
  currentTrack: TrackDTO | null;
  queue: TrackDTO[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isShuffled: boolean;
  originalQueue: TrackDTO[];
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  repeatMode: 'off',
  isShuffled: false,
  originalQueue: [],
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<TrackDTO | null>) => {
      state.currentTrack = action.payload;
      state.currentTime = 0;
    },
    
    setQueue: (state, action: PayloadAction<{ tracks: TrackDTO[]; startIndex?: number }>) => {
      state.queue = action.payload.tracks;
      state.queueIndex = action.payload.startIndex ?? 0;
      state.currentTrack = action.payload.tracks[state.queueIndex] || null;
      state.currentTime = 0;
      state.originalQueue = action.payload.tracks;
    },
    
    addToQueue: (state, action: PayloadAction<TrackDTO>) => {
      state.queue.push(action.payload);
      if (state.queue.length === 1) {
        state.queueIndex = 0;
        state.currentTrack = action.payload;
      }
    },
    
    addToQueueNext: (state, action: PayloadAction<TrackDTO>) => {
      const insertIndex = state.queueIndex + 1;
      state.queue.splice(insertIndex, 0, action.payload);
    },
    
    removeFromQueue: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
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
      state.queueIndex = -1;
      state.currentTrack = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.originalQueue = [];
    },
    
    playTrack: (state, action: PayloadAction<TrackDTO>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
      state.currentTime = 0;

      const existingIndex = state.queue.findIndex(t => t.id === action.payload.id);
      if (existingIndex >= 0) {
        state.queueIndex = existingIndex;
      } else {
        state.queue.push(action.payload);
        state.queueIndex = state.queue.length - 1;
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
  },
});

export const {
  setCurrentTrack,
  setQueue,
  addToQueue,
  addToQueueNext,
  removeFromQueue,
  clearQueue,
  playTrack,
  playNext,
  playPrevious,
  togglePlayPause,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  setRepeatMode,
  toggleShuffle,
} = playerSlice.actions;

export default playerSlice.reducer;

