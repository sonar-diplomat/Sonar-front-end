import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Settings } from '@entities/ClientSettings';

interface ClientSettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

// Загружаем настройки из localStorage при инициализации
const loadSettingsFromStorage = (): Settings | null => {
  try {
    const stored = localStorage.getItem('sonar_client_settings');
    if (stored) {
      return JSON.parse(stored) as Settings;
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return null;
};

const initialState: ClientSettingsState = {
  settings: loadSettingsFromStorage(),
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
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('sonar_client_settings', JSON.stringify(action.payload));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    },
    
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
        
        // Сохраняем обновленные настройки в localStorage
        try {
          localStorage.setItem('sonar_client_settings', JSON.stringify(state.settings));
        } catch (error) {
          console.error('Failed to update settings in localStorage:', error);
        }
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearSettings: (state) => {
      state.settings = null;
      state.error = null;
      
      // Очищаем localStorage
      try {
        localStorage.removeItem('sonar_client_settings');
      } catch (error) {
        console.error('Failed to clear settings from localStorage:', error);
      }
    },
  },
});

export const { setSettings, updateSettings, setLoading, setError, clearSettings } = clientSettingsSlice.actions;
export default clientSettingsSlice.reducer;

