import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

import type { Settings } from '@entities/ClientSettings';
import { isDemoMode } from '@shared/config/data-source';

interface ClientSettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

// Older versions stored a whole account snapshot without an owner identifier.
export function clearLegacyClientSettings(): void {
  if (isDemoMode) return;
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('sonar_client_settings');
  } catch (error) {
    console.error('Failed to clear legacy settings from localStorage:', error);
  }
}

const initialState: ClientSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

const clientSettingsSlice = createSlice({
  name: 'clientSettings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
      state.error = null;
    },
    
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearSettings: () => initialState,
  },
});

export const { setSettings, updateSettings, setLoading, setError, clearSettings } = clientSettingsSlice.actions;
export default clientSettingsSlice.reducer;

