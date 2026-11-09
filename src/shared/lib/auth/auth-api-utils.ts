import type { LoginResultDTO,RefreshTokenResponse } from '@features/auth';
import { apiClient } from '@shared/api/oldBaseApi';
import { API_ENDPOINTS } from '@shared/config';
export const authApiLogin = (userIdentifier: string, password: string, deviceName: string) => apiClient.post<LoginResultDTO>(API_ENDPOINTS.auth.login, undefined, { params: { userIdentifier, password }, headers: { 'X-Device-Name': deviceName }, withAuth: false });
export const authApiRefreshToken = (token: string) => apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.auth.refreshToken, token, { withAuth: false });
