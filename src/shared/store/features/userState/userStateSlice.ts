import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserStateState {
  currentPosition: string | null; // TimeSpan в формате строки
  currentTrackId: number | null;
  currentCollectionId: number | null;
  statusId: number | null;
  isLoading: boolean;
}

const initialState: UserStateState = {
  currentPosition: null,
  currentTrackId: null,
  currentCollectionId: null,
  statusId: null,
  isLoading: false,
};

const userStateSlice = createSlice({
  name: 'userState',
  initialState,
  reducers: {
    setCurrentPosition: (state, action: PayloadAction<string>) => {
      state.currentPosition = action.payload;
    },
    
    setListeningTarget: (state, action: PayloadAction<{ trackId: number; collectionId?: number }>) => {
      state.currentTrackId = action.payload.trackId;
      state.currentCollectionId = action.payload.collectionId ?? null;
    },
    
    setStatus: (state, action: PayloadAction<number>) => {
      state.statusId = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    clearUserState: (state) => {
      state.currentPosition = null;
      state.currentTrackId = null;
      state.currentCollectionId = null;
      state.statusId = null;
    },
  },
});

export const { setCurrentPosition, setListeningTarget, setStatus, setLoading, clearUserState } = userStateSlice.actions;
export default userStateSlice.reducer;

