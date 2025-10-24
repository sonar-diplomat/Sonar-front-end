import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';

export async function useRevokeAllSessions(): Promise<BaseResponse<string>> {
    try {
        return await apiClient.post<string>(API_ENDPOINTS.auth.revokeAllSessions);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'All sessions revocation failed');
    }
}