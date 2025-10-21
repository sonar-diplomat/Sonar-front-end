
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5205';

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/Auth/login',
    verify2FA: '/api/Auth/verify-2fa',
    refreshToken: '/api/Auth/refresh-token',
    changePassword: '/api/Auth/change-password',
    requestPasswordChange: '/api/Auth/RequestPasswordChange',
    confirmEmailChange: '/api/Auth/confirm-email-change',
    getMailChangeToken: '/api/Auth/GetMailChangeToken',
    getSessions: '/api/Auth/sessions',
    revokeSession: (sessionId: number) => `/api/Auth/${sessionId}/revoke`,
    revokeAllSessions: '/api/Auth/sessions/revoke-all',
  },
} as const;