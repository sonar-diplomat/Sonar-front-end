import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { UserRegisterDTO } from '@features/auth';

export async function useRegister(userData: UserRegisterDTO): Promise<BaseResponse<string>> {
    try {
        return await apiClient.post<string>(API_ENDPOINTS.auth.register, userData);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Registration failed');
    }
}