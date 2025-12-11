import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginResponseDTO } from '@features/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Загружаем токены из storage при инициализации
// Access token хранится в sessionStorage (более безопасно, очищается при закрытии вкладки)
// Refresh token хранится в localStorage (для долгосрочной сессии)
const loadTokensFromStorage = (): Partial<AuthState> => {
  try {
    const accessToken = sessionStorage.getItem('sonar_access_token');
    const refreshToken = localStorage.getItem('sonar_refresh_token');
    const sessionIdStr = sessionStorage.getItem('sonar_session_id') || localStorage.getItem('sonar_session_id');
    
    return {
      accessToken,
      refreshToken,
      sessionId: sessionIdStr ? Number(sessionIdStr) : null,
      isAuthenticated: !!(accessToken && refreshToken),
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      isAuthenticated: false,
    };
  }
};

const initialState: AuthState = {
  ...loadTokensFromStorage(),
  isLoading: false,
} as AuthState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponseDTO>) => {
      const { accessToken, refreshToken, sessionId } = action.payload;
      
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.sessionId = sessionId;
      state.isAuthenticated = true;
      
      // Сохраняем токены: access token в sessionStorage (более безопасно), refresh token в localStorage
      try {
        sessionStorage.setItem('sonar_access_token', accessToken);
        localStorage.setItem('sonar_refresh_token', refreshToken);
        sessionStorage.setItem('sonar_session_id', String(sessionId));
      } catch (error) {
        console.error('Failed to save tokens to storage:', error);
      }
    },
    
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      try {
        // Access token хранится в sessionStorage для безопасности
        sessionStorage.setItem('sonar_access_token', action.payload);
      } catch (error) {
        console.error('Failed to update access token in sessionStorage:', error);
      }
    },
    
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true; // Устанавливаем isAuthenticated при обновлении токенов
      
      try {
        // Access token в sessionStorage, refresh token в localStorage
        sessionStorage.setItem('sonar_access_token', action.payload.accessToken);
        localStorage.setItem('sonar_refresh_token', action.payload.refreshToken);
      } catch (error) {
        console.error('Failed to update tokens in storage:', error);
      }
    },
    
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.isAuthenticated = false;
      
      // Очищаем токены из обоих хранилищ
      try {
        sessionStorage.removeItem('sonar_access_token');
        sessionStorage.removeItem('sonar_session_id');
        localStorage.removeItem('sonar_refresh_token');
        // Также очищаем старые токены из localStorage на случай миграции
        localStorage.removeItem('sonar_access_token');
        localStorage.removeItem('sonar_session_id');
      } catch (error) {
        console.error('Failed to clear tokens from storage:', error);
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, updateAccessToken, updateTokens, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;

