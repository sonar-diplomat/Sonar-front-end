import { useCallback } from 'react';

import type { TwoFactorChallengeDTO } from '@features/auth';
import { useLoginMutation } from '@shared/api';
import { authManager } from '@shared/lib';
import { useAccess } from '@shared/store/features/access/useAccess';
import { setCredentials,setLoading } from '@shared/store/features/auth/authSlice';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useAppDispatch,useAppSelector } from '@shared/store/hooks';

import { decodeJWT } from './jwt-utils';

/**
 * Хук для работы с авторизацией
 * Предоставляет удобный интерфейс для логина, логаута и проверки статуса
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, sessionId, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const { loadSettings } = useClientSettings();
  const { loadUserAccessFeatures, loadAllAccessFeatures } = useAccess();
  
  const login = useCallback(async (
    userIdentifier: string,
    password: string,
    deviceName: string,
    _rememberMe: boolean = false
  ): Promise<boolean | TwoFactorChallengeDTO> => {
    void _rememberMe;
    dispatch(setLoading(true));
    const request = loginMutation({ userIdentifier, password, deviceName });
    try {
      const data = await request.unwrap();
      if (data && 'requiresTwoFactor' in data) return data;
      
      if (data) {
        dispatch(setCredentials(data));
        
        // Загружаем данные пользователя после успешного логина
        try {
          // Загружаем настройки клиента
          await loadSettings();
          
          // Загружаем все доступные функции доступа (справочник)
          await loadAllAccessFeatures();
          
          // Загружаем функции доступа текущего пользователя
          // Пытаемся получить userId из JWT токена
          const decoded = decodeJWT(data.accessToken);
          if (decoded) {
            // Обычно в JWT есть sub, nameid, userId или подобное поле
            const userId = decoded.sub || decoded.nameid || decoded.userId || decoded.id;
            if (userId && typeof userId === 'number') {
              await loadUserAccessFeatures(userId);
            } else if (userId && typeof userId === 'string') {
              // Если userId строка, пытаемся преобразовать в число
              const userIdNum = parseInt(userId, 10);
              if (!isNaN(userIdNum)) {
                await loadUserAccessFeatures(userIdNum);
              }
            }
          }
        } catch (error) {
          // Не блокируем логин, если загрузка данных не удалась
          console.error('Failed to load user data after login:', error);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      // Обработка ошибки логина
      console.error('Login failed:', error);
      return false;
    } finally {
      request.reset();
      dispatch(setLoading(false));
    }
  }, [loginMutation, dispatch, loadSettings, loadAllAccessFeatures, loadUserAccessFeatures]);
  
  const logout = useCallback(() => {
    void authManager.logout();
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    return await authManager.refreshAccessToken();
  }, []);
  
  return {
    isAuthenticated,
    accessToken,
    sessionId,
    isLoading: authLoading || loginLoading,
    login,
    logout,
    refreshToken,
  };
};

