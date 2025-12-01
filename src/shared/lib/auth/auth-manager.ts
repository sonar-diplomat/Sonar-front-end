import { store } from '@shared/store';
import { updateTokens, logout, setCredentials } from '@shared/store/features/auth/authSlice';
import { authApiLogin, authApiRefreshToken } from './auth-api-utils';
import { authStorage, type AuthCredentials } from './auth-storage';
import { signalRManager } from '../signalr/signalr-manager';

/**
 * Централизованный менеджер авторизации
 * Управляет токенами, сессиями и автоматическим refresh
 */
class AuthManager {
  private refreshPromise: Promise<string | null> | null = null;

  /**
   * Получает текущий access token из Redux store
   */
  getAccessToken(): string | null {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (import.meta.env.DEV) {
      console.log('[authManager] getAccessToken:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        isAuthenticated: state.auth.isAuthenticated,
      });
    }
    return token;
  }

  /**
   * Получает текущий refresh token из Redux store
   */
  getRefreshToken(): string | null {
    const state = store.getState();
    const token = state.auth.refreshToken;
    if (import.meta.env.DEV) {
      console.log('[authManager] getRefreshToken:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });
    }
    return token;
  }

  /**
   * Получает текущий session ID из Redux store
   */
  getSessionId(): number | null {
    const state = store.getState();
    return state.auth.sessionId;
  }

  /**
   * Проверяет, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth.isAuthenticated;
  }

  /**
   * Обновляет access token используя refresh token
   * Предотвращает множественные одновременные refresh запросы
   */
  async refreshAccessToken(): Promise<string | null> {
    // Если уже идет refresh, возвращаем существующий промис
    if (this.refreshPromise) {
      if (import.meta.env.DEV) {
        console.log('[authManager] refreshAccessToken: Already in progress, waiting...');
      }
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      if (import.meta.env.DEV) {
        console.warn('[authManager] refreshAccessToken: No refresh token available, logging out');
      }
      this.logout();
      return null;
    }

    if (import.meta.env.DEV) {
      console.log('[authManager] refreshAccessToken: Starting token refresh...');
    }

    this.refreshPromise = (async () => {
      try {
        // Отправляем refresh token как raw string в body (согласно API)
        const res = await authApiRefreshToken(refreshToken);

        if (res.success && res.data) {
          // Обновляем токены в Redux store
          store.dispatch(
            updateTokens({
              accessToken: res.data.newAccessToken,
              refreshToken: res.data.refreshToken,
            })
          );
          if (import.meta.env.DEV) {
            console.log('[authManager] refreshAccessToken: Token refreshed successfully');
          }
          return res.data.newAccessToken;
        } else {
          // Refresh failed - logout
          const errorMsg = res.errors?.[0] || res.details?.[0] || res.message || 'Unknown error';
          console.error('[authManager] refreshAccessToken: Token refresh failed:', errorMsg);
          if (import.meta.env.DEV) {
            console.warn('[authManager] refreshAccessToken: ⚠️ Требуется новый логин - refresh token недействителен');
          }
          this.logout();
          return null;
        }
      } catch (error) {
        console.error('[authManager] refreshAccessToken: Token refresh error:', error);
        if (import.meta.env.DEV) {
          console.warn('[authManager] refreshAccessToken: ⚠️ Требуется новый логин - ошибка при обновлении токена');
        }
        this.logout();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Выход из системы
   * Очищает токены и может вызвать API для ревокации сессии на сервере
   */
  async logout(): Promise<void> {
    if (import.meta.env.DEV) {
      console.log('[authManager] logout: Clearing tokens and logging out');
    }
    
    // Отключаем SignalR соединение
    try {
      await signalRManager.disconnect();
    } catch (error) {
      console.error('[authManager] Error disconnecting SignalR:', error);
    }
    
    store.dispatch(logout());
    // Опционально: можно вызвать API для ревокации сессии на сервере
    // Но обычно это делается через отдельный вызов revokeSession или revokeAllSessions
  }

  /**
   * Обработчик для onUnauthorized в API клиенте
   * Автоматически пытается обновить токен при получении 401
   */
  async handleUnauthorized(): Promise<void> {
    await this.refreshAccessToken();
  }

  /**
   * Автоматический логин используя сохраненные credentials
   * Вызывается хуками перед API запросами, если токена нет
   */
  async autoLogin(): Promise<boolean> {
    const credentials = authStorage.getCredentials();
    if (!credentials) {
      if (import.meta.env.DEV) {
        console.warn('[authManager] autoLogin: ⚠️ Требуется новый логин - сохраненные credentials отсутствуют');
      }
      return false;
    }

    if (import.meta.env.DEV) {
      console.log('[authManager] autoLogin: Attempting auto-login with saved credentials...');
    }

    try {
      const res = await authApiLogin(
        credentials.userIdentifier,
        credentials.password,
        credentials.deviceName
      );

      if (res.success && res.data) {
        store.dispatch(setCredentials(res.data));
        if (import.meta.env.DEV) {
          console.log('[authManager] autoLogin: ✅ Auto-login successful');
        }
        return true;
      }

      // Если логин не удался, удаляем credentials
      const errorMsg = res.errors?.[0] || res.details?.[0] || res.message || 'Unknown error';
      console.error('[authManager] autoLogin: Auto-login failed:', errorMsg);
      if (import.meta.env.DEV) {
        console.warn('[authManager] autoLogin: ⚠️ Требуется новый логин - неверные credentials');
      }
      authStorage.clearCredentials();
      return false;
    } catch (error) {
      console.error('[authManager] autoLogin: Auto-login error:', error);
      if (import.meta.env.DEV) {
        console.warn('[authManager] autoLogin: ⚠️ Требуется новый логин - ошибка при auto-login');
      }
      authStorage.clearCredentials();
      return false;
    }
  }

  /**
   * Сохраняет credentials для автоматического логина
   */
  saveCredentials(credentials: AuthCredentials): void {
    authStorage.saveCredentials(credentials);
  }

  /**
   * Удаляет сохраненные credentials
   */
  clearCredentials(): void {
    authStorage.clearCredentials();
  }
}

export const authManager = new AuthManager();

