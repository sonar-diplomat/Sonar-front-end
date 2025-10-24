import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';

export async function useRequestPasswordChange(): Promise<BaseResponse<string>> {
    try {
        return await apiClient.post<string>(API_ENDPOINTS.auth.requestPasswordChange);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Password change request failed');
    }
}