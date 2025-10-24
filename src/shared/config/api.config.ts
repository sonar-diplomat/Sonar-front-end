export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5205/api/';

export const API_ENDPOINTS = {
    auth: {
        register: 'Auth/register',
        login: 'Auth/login',
        verify2FA: 'Auth/verify-2fa',
        refreshToken: 'Auth/refresh-token',
        changePassword: 'Auth/confirm-password-change',
        requestPasswordChange: 'Auth/request-password-change',
        confirmEmailChange: 'Auth/confirm-email-change',
        getMailChangeToken: 'Auth/request-email-change',
        getSessions: 'Auth/sessions',
        revokeSession: (sessionId: number) => `Auth/sessions/${sessionId}/revoke`,
        revokeAllSessions: 'Auth/sessions/revoke-all',
    },
} as const;