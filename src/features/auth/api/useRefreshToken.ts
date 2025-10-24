import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { RefreshTokenResponse } from '@features/auth';

export async function useRefreshToken(refreshToken: string): Promise<BaseResponse<RefreshTokenResponse>> {
    try {
        return await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.auth.refreshToken, { refreshToken });
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Token refresh failed');
    }
}