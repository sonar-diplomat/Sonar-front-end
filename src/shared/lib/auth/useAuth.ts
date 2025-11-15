import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/store/hooks';
import { setCredentials, logout as logoutAction, setLoading } from '@shared/store/features/auth/authSlice';
import { useLogin as useLoginApi } from '@features/auth/model/store';
import { authManager } from './auth-manager';
import type { LoginResponseDTO } from '@features/auth';
import type { AuthCredentials } from './auth-storage';

/**
 * Хук для работы с авторизацией
 * Предоставляет удобный интерфейс для логина, логаута и проверки статуса
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, sessionId, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { mutate: loginApi, loading: loginLoading } = useLoginApi();
  
  const login = useCallback(async (
    userIdentifier: string,
    password: string,
    deviceName: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const res = await loginApi(userIdentifier, password, deviceName);
      
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        
        // Сохраняем credentials для автоматического логина, если rememberMe = true
        if (rememberMe) {
          authManager.saveCredentials({
            userIdentifier,
            password,
            deviceName,
          });
        }
        
        return true;
      }
      
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [loginApi, dispatch]);
  
  const logout = useCallback(() => {
    // Удаляем credentials при выходе
    authManager.clearCredentials();
    dispatch(logoutAction());
  }, [dispatch]);

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

