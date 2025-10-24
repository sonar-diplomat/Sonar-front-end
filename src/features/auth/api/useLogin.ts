import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { LoginResponseDTO } from '@features/auth';

export async function useLogin(userIdentifier: string, password: string): Promise<BaseResponse<LoginResponseDTO>> {
    try {
        return await apiClient.post<LoginResponseDTO>(API_ENDPOINTS.auth.login, {
            userIdentifier,
            password,
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Login failed');
    }
}