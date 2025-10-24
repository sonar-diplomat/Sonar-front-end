
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5205/api/';

export const API_ENDPOINTS = {
  auth: {
    register: 'auth/register',
    login: 'auth/login',
    verify2FA: 'auth/verify-2fa',
    refreshToken: 'auth/refresh-token',
    changePassword: 'auth/change-password',
    requestPasswordChange: 'auth/RequestPasswordChange',
    confirmEmailChange: 'auth/confirm-email-change',
    getMailChangeToken: 'auth/GetMailChangeToken',
    getSessions: 'auth/sessions',
    revokeSession: (sessionId: number) => `/api/Auth/${sessionId}/revoke`,
    revokeAllSessions: 'auth/sessions/revoke-all',
  },
} as const;