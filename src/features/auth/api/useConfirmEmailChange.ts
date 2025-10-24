import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { BaseResponse } from '@shared/types';
import type { ConfirmEmailChangeDTO } from '@features/auth';

export async function useConfirmEmailChange(dto: ConfirmEmailChangeDTO): Promise<BaseResponse<string>> {
    try {
        return await apiClient.post<string>(API_ENDPOINTS.auth.confirmEmailChange, dto);
    } catch (error: any) {
        throw new Error(error.response?.data?.messages?.join(', ') || 'Email change confirmation failed');
    }
}