import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setCredentials, logout as logoutAction, setLoading } from '@shared/store/features/auth/authSlice';
import { useLoginMutation } from '@shared/api';
import { authManager } from '@shared/lib';
import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
import { useAccess } from '@shared/store/features/access/useAccess';
import { useUserState } from '@shared/store/features/userState/useUserState';
import { decodeJWT } from './jwt-utils';

/**
 * Хук для работы с авторизацией
 * Предоставляет удобный интерфейс для логина, логаута и проверки статуса
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, sessionId, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const { loadSettings, clear: clearSettings } = useClientSettings();
  const { loadUserAccessFeatures, loadAllAccessFeatures, clear: clearAccess } = useAccess();
  const { clear: clearUserState } = useUserState();
  
  const login = useCallback(async (
    userIdentifier: string,
    password: string,
    deviceName: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const data = await loginMutation({ userIdentifier, password, deviceName }).unwrap();
      
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
      dispatch(setLoading(false));
    }
  }, [loginMutation, dispatch, loadSettings, loadAllAccessFeatures, loadUserAccessFeatures]);
  
  const logout = useCallback(() => {
    // Очищаем все слайсы
    clearSettings();
    clearAccess();
    clearUserState();
    
    // Очищаем auth
    dispatch(logoutAction());
  }, [dispatch, clearSettings, clearAccess, clearUserState]);

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

