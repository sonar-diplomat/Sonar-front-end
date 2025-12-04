import { rtkBaseQuery } from '@shared/api/rtkBaseQuery';
import { API_ENDPOINTS } from '@shared/config';
import type { NormalizedApiResponse } from '@shared/types/api';
import type { LoginResponseDTO, RefreshTokenResponse } from '@features/auth';

/**
 * Утилитарные функции для auth-manager
 * Используют rtkBaseQuery напрямую, так как auth-manager работает вне React компонентов
 */

/**
 * Выполняет логин через API
 */
export async function authApiLogin(
  userIdentifier: string,
  password: string,
  deviceName: string
): Promise<NormalizedApiResponse<LoginResponseDTO>> {
  const result = await rtkBaseQuery({
    url: API_ENDPOINTS.auth.login,
    method: 'POST',
    params: { userIdentifier, password },
    headers: { 'X-Device-Name': deviceName },
    withAuth: false,
  });

  if (result.error) {
    return {
      success: false,
      status: result.error.status,
      message: result.error.data?.message || 'Login failed',
      errors: result.error.data?.errors || [result.error.data?.message || 'Login failed'],
      details: result.error.data?.details,
    };
  }

  return {
    success: true,
    status: 200,
    data: result.data as LoginResponseDTO,
    message: 'Login successful',
  };
}

/**
 * Обновляет токен через API
 */
export async function authApiRefreshToken(
  token: string
): Promise<NormalizedApiResponse<RefreshTokenResponse>> {
  const result = await rtkBaseQuery({
    url: API_ENDPOINTS.auth.refreshToken,
    method: 'POST',
    body: `"${token}"`,
    bodyType: 'raw',
    withAuth: false,
  });

  if (result.error) {
    return {
      success: false,
      status: result.error.status,
      message: result.error.data?.message || 'Token refresh failed',
      errors: result.error.data?.errors || [result.error.data?.message || 'Token refresh failed'],
      details: result.error.data?.details,
    };
  }

  return {
    success: true,
    status: 200,
    data: result.data as RefreshTokenResponse,
    message: 'Token refreshed successfully',
  };
}

