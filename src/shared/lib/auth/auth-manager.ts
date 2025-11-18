import { store } from '@shared/store';
import { updateTokens, logout, setCredentials } from '@shared/store/features/auth/authSlice';
import { Api } from '@features/auth/api/api';
import { authStorage, type AuthCredentials } from './auth-storage';

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
    return state.auth.accessToken;
  }

  /**
   * Получает текущий refresh token из Redux store
   */
  getRefreshToken(): string | null {
    const state = store.getState();
    return state.auth.refreshToken;
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
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        // Отправляем refresh token как raw string в body (согласно API)
        const res = await Api.refreshToken(refreshToken);

        if (res.success && res.data) {
          // Обновляем токены в Redux store
          store.dispatch(
            updateTokens({
              accessToken: res.data.newAccessToken,
              refreshToken: res.data.refreshToken,
            })
          );
          return res.data.newAccessToken;
        } else {
          // Refresh failed - logout
          console.error('Token refresh failed:', res.errors?.[0] || res.details?.[0] || res.message);
          this.logout();
          return null;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
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
  logout(): void {
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
      return false;
    }

    try {
      const res = await Api.login(
        credentials.userIdentifier,
        credentials.password,
        credentials.deviceName
      );

      if (res.success && res.data) {
        store.dispatch(setCredentials(res.data));
        return true;
      }

      // Если логин не удался, удаляем credentials
      authStorage.clearCredentials();
      return false;
    } catch (error) {
      console.error('Auto login failed:', error);
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

