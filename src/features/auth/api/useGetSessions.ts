import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { ActiveUserSessionDTO } from '@features/auth';

export async function useGetSessions(): Promise<BaseResponse<ActiveUserSessionDTO[]>> {
    try {
        return await apiClient.get<ActiveUserSessionDTO[]>(API_ENDPOINTS.auth.getSessions);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Failed to retrieve sessions');
    }
}