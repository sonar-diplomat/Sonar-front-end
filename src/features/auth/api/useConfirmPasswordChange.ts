import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { ConfirmPasswordChangeDTO } from '@features/auth';

export async function useConfirmPasswordChange(dto: ConfirmPasswordChangeDTO): Promise<BaseResponse<string>> {
    try {
        return await apiClient.post<string>(API_ENDPOINTS.auth.changePassword, dto);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Password change failed');
    }
}