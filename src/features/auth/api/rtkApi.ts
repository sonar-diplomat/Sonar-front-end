import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  ActiveSessionDTO,
  UserRegisterDTO,
  LoginResponseDTO,
  Verify2FaDTO,
  Verify2FaResponseDTO,
  RefreshTokenResponse,
  ConfirmEmailChangeDTO,
  ConfirmPasswordChangeDTO,
} from '../model/types';

/**
 * Auth API endpoints
 */
export const authApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query<ActiveSessionDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.auth.getSessions,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    register: builder.mutation<void, UserRegisterDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.register,
        method: 'POST',
        body: data,
        withAuth: false,
      }),
    }),

    login: builder.mutation<LoginResponseDTO, { userIdentifier: string; password: string; deviceName: string }>({
      query: ({ userIdentifier, password, deviceName }) => ({
        url: API_ENDPOINTS.auth.login,
        method: 'POST',
        params: { userIdentifier, password },
        headers: { 'X-Device-Name': deviceName },
        withAuth: false,
      }),
    }),

    verify2FA: builder.mutation<Verify2FaResponseDTO, { dto: Verify2FaDTO; deviceName: string }>({
      query: ({ dto, deviceName }) => ({
        url: API_ENDPOINTS.auth.verify2FA,
        method: 'POST',
        body: dto,
        headers: { 'X-Device-Name': deviceName },
        withAuth: true,
      }),
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, string>({
      query: (token) => ({
        url: API_ENDPOINTS.auth.refreshToken,
        method: 'POST',
        body: token,
        bodyType: 'raw',
        withAuth: false,
      }),
    }),

    requestEmailChange: builder.mutation<void, string>({
      query: (email) => ({
        url: API_ENDPOINTS.auth.getMailChangeToken,
        method: 'POST',
        body: email,
        bodyType: 'raw',
        withAuth: true,
      }),
    }),

    confirmEmailChange: builder.mutation<void, ConfirmEmailChangeDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.confirmEmailChange,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
    }),

    confirmPasswordChange: builder.mutation<void, ConfirmPasswordChangeDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.changePassword,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
    }),

    requestPasswordChange: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.requestPasswordChange,
        method: 'POST',
        withAuth: true,
      }),
    }),

    revokeSession: builder.mutation<void, number>({
      query: (sessionId) => ({
        url: API_ENDPOINTS.auth.revokeSession(sessionId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),

    revokeAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.revokeAllSessions,
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),
  }),
});

// Export hooks
export const {
  useGetSessionsQuery,
  useRegisterMutation,
  useLoginMutation,
  useVerify2FAMutation,
  useRefreshTokenMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useConfirmPasswordChangeMutation,
  useRequestPasswordChangeMutation,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} = authApi;

