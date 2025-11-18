/**
 * Хранилище для credentials авторизации
 * Используется для автоматического логина при первом запросе
 */

const CREDENTIALS_KEY = 'sonar_auth_credentials';

export interface AuthCredentials {
  userIdentifier: string;
  password: string;
  deviceName: string;
}

export const authStorage = {
  /**
   * Сохраняет credentials для автоматического логина
   */
  saveCredentials: (credentials: AuthCredentials): void => {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  },

  /**
   * Получает сохраненные credentials
   */
  getCredentials: (): AuthCredentials | null => {
    try {
      const data = localStorage.getItem(CREDENTIALS_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Удаляет сохраненные credentials
   */
  clearCredentials: (): void => {
    try {
      localStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  },

  /**
   * Проверяет, есть ли сохраненные credentials
   */
  hasCredentials: (): boolean => {
    return authStorage.getCredentials() !== null;
  },
};

