import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { Verify2FaDTO } from '@features/auth';

export async function useVerify2Fa(dto: Verify2FaDTO): Promise<BaseResponse<[string, string]>> {
    try {
        return await apiClient.post<[string, string]>(API_ENDPOINTS.auth.verify2FA, dto);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || '2FA verification failed');
    }
}