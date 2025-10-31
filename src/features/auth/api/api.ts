import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type {
    UserRegisterDTO,
    LoginResponseDTO,
    Verify2FaDTO,
    RefreshTokenResponse,
    ConfirmEmailChangeDTO,
    ConfirmPasswordChangeDTO,
    ActiveSessionDTO, Verify2FaResponseDTO,
} from '@features/auth';

export const Api = {
    register: (data: UserRegisterDTO) =>
        apiClient.post<void>(API_ENDPOINTS.auth.register, data),

    login: (userIdentifier: string, password: string, deviceName: string) =>
        apiClient.post<LoginResponseDTO>(
            `${API_ENDPOINTS.auth.login}?userIdentifier=${encodeURIComponent(userIdentifier)}&password=${encodeURIComponent(password)}`,
            undefined,
            {
                headers: { 'X-Device-Name': deviceName },
            }
        ),

    verify2FA: (data: Verify2FaDTO, deviceName: string) =>
        apiClient.post<Verify2FaResponseDTO>(API_ENDPOINTS.auth.verify2FA, data, {
            headers: { 'X-Device-Name': deviceName },
        }),

    refreshToken: (token: string) =>
        apiClient.post<RefreshTokenResponse>(
            API_ENDPOINTS.auth.refreshToken,
            token,
            { bodyType: 'raw' }
        ),

    requestEmailChange: (email: string) =>
        apiClient.post<void>(API_ENDPOINTS.auth.getMailChangeToken, email, {
            bodyType: 'raw',
        }),

    confirmEmailChange: (data: ConfirmEmailChangeDTO) =>
        apiClient.post<void>(API_ENDPOINTS.auth.confirmEmailChange, data),

    confirmPasswordChange: (data: ConfirmPasswordChangeDTO) =>
        apiClient.post<void>(API_ENDPOINTS.auth.changePassword, data),

    requestPasswordChange: () =>
        apiClient.post<void>(API_ENDPOINTS.auth.requestPasswordChange),

    getSessions: () =>
        apiClient.get<ActiveSessionDTO[]>(API_ENDPOINTS.auth.getSessions),

    revokeSession: (sessionId: number) =>
        apiClient.post<void>(API_ENDPOINTS.auth.revokeSession(sessionId)),

    revokeAllSessions: () =>
        apiClient.post<void>(API_ENDPOINTS.auth.revokeAllSessions),
};
