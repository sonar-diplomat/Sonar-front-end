import { authManager } from './auth-manager';
import { shouldRefreshToken } from './jwt-utils';
import type { NormalizedApiResponse } from '@shared/types/api';

/**
 * Обертка для API запросов, которая автоматически проверяет авторизацию
 * и при необходимости выполняет автоматический логин или обновление токена
 */
export async function withAuth<T>(
  apiCall: () => Promise<NormalizedApiResponse<T>>
): Promise<NormalizedApiResponse<T>> {
  const accessToken = authManager.getAccessToken();
  const refreshToken = authManager.getRefreshToken();

  // Если нет токенов вообще, пытаемся автоматически залогиниться
  if (!accessToken && !refreshToken) {
    const loginSuccess = await authManager.autoLogin();
    
    if (!loginSuccess) {
      return {
        success: false,
        status: 401,
        message: 'Authentication required',
        errors: ['Please login to continue'],
        details: undefined,
      };
    }
  }

  // Если есть access token, проверяем его валидность
  if (accessToken) {
    // Если токен истекает или истек, пытаемся обновить его через refresh token
    if (shouldRefreshToken(accessToken) && refreshToken) {
      const newToken = await authManager.refreshAccessToken();
      
      // Если refresh не удался и нет токена, пытаемся автологин
      if (!newToken) {
        const loginSuccess = await authManager.autoLogin();
        
        if (!loginSuccess) {
          return {
            success: false,
            status: 401,
            message: 'Authentication required',
            errors: ['Session expired. Please login again'],
            details: undefined,
          };
        }
      }
    }
  } else if (refreshToken) {
    // Если нет access token, но есть refresh token, пытаемся обновить
    const newToken = await authManager.refreshAccessToken();
    
    if (!newToken) {
      // Если refresh не удался, пытаемся автологин
      const loginSuccess = await authManager.autoLogin();
      
      if (!loginSuccess) {
        return {
          success: false,
          status: 401,
          message: 'Authentication required',
          errors: ['Session expired. Please login again'],
          details: undefined,
        };
      }
    }
  }

  // Выполняем API запрос
  return apiCall();
}

