import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  DistributorDTO,
  DistributorAccountDTO,
  ArtistRegistrationRequestDTO,
  CreateDistributorDTO,
  UpdateDistributorDTO,
  DistributorAccountRegisterDTO,
  DistributorAccountChangePasswordDTO,
} from '../model/types';
import type { LoginResponseDTO, RefreshTokenResponse } from '@features/auth';

/**
 * Distribution API endpoints
 */
export const distributionApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistributors: builder.query<DistributorDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.distributor.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Distributor', id: 'LIST' }],
    }),

    getDistributor: builder.query<DistributorDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributor.byId(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Distributor', id }],
    }),

    getDistributorAccount: builder.query<DistributorAccountDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributorMaster.getAccount(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'DistributorAccount', id }],
    }),

    getArtistRequests: builder.query<ArtistRegistrationRequestDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.distributor.request,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ArtistRegistrationRequest', id: 'LIST' }],
    }),

    getArtistRequest: builder.query<ArtistRegistrationRequestDTO, number>({
      query: (requestId) => ({
        url: API_ENDPOINTS.distributor.requestById(requestId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, requestId) => [{ type: 'ArtistRegistrationRequest', id: requestId }],
    }),

    createDistributor: builder.mutation<DistributorDTO, CreateDistributorDTO>({
      query: (dto) => {
        const fd = new FormData();
        fd.append('Name', dto.name);
        fd.append('Description', dto.description);
        fd.append('ContactEmail', dto.contactEmail);
        fd.append('ExpirationDate', dto.expirationDate);
        fd.append('Cover', dto.cover);
        return {
          url: API_ENDPOINTS.distributor.create,
          method: 'POST',
          body: fd,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: [{ type: 'Distributor', id: 'LIST' }],
    }),

    updateDistributor: builder.mutation<DistributorDTO, { id: number; dto: UpdateDistributorDTO }>({
      query: ({ id, dto }) => ({
        url: API_ENDPOINTS.distributor.update(id),
        method: 'PUT',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Distributor', id },
        { type: 'Distributor', id: 'LIST' },
      ],
    }),

    deleteDistributor: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributor.delete(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Distributor', id },
        { type: 'Distributor', id: 'LIST' },
      ],
    }),

    updateDistributorKey: builder.mutation<string, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributor.updateKey(id),
        method: 'GET',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Distributor', id }],
    }),

    resolveArtistRequest: builder.mutation<void, { requestId: number; approve: boolean }>({
      query: ({ requestId, approve }) => ({
        url: API_ENDPOINTS.distributor.resolveRequest(requestId),
        method: 'POST',
        params: { approve },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { requestId }) => [
        { type: 'ArtistRegistrationRequest', id: requestId },
        { type: 'ArtistRegistrationRequest', id: 'LIST' },
      ],
    }),

    registerDistributorAccount: builder.mutation<DistributorAccountDTO, DistributorAccountRegisterDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.authDistributor.register,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'DistributorAccount', id: 'LIST' }],
    }),

    distributorLogin: builder.mutation<LoginResponseDTO, { email: string; password: string; deviceName: string }>({
      query: ({ email, password, deviceName }) => ({
        url: `${API_ENDPOINTS.authDistributor.login}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        method: 'POST',
        headers: { 'X-Device-Name': deviceName },
        withAuth: false,
      }),
    }),

    distributorRefreshToken: builder.mutation<RefreshTokenResponse, string>({
      query: (token) => ({
        url: API_ENDPOINTS.authDistributor.refreshToken,
        method: 'POST',
        body: token,
        bodyType: 'raw',
        withAuth: false,
      }),
    }),

    terminateDistributorSession: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.authDistributor.terminateSession(id),
        method: 'DELETE',
        withAuth: true,
      }),
    }),

    distributorRevokeSession: builder.mutation<void, number>({
      query: (sessionId) => ({
        url: API_ENDPOINTS.authDistributor.revokeSession(sessionId),
        method: 'POST',
        withAuth: true,
      }),
    }),

    distributorRevokeAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.authDistributor.revokeAllSessions,
        method: 'POST',
        withAuth: true,
      }),
    }),

    deleteDistributorAccount: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributorMaster.deleteAccount(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'DistributorAccount', id }],
    }),

    changeDistributorUsername: builder.mutation<void, { id: number; newUserName: string }>({
      query: ({ id, newUserName }) => ({
        url: API_ENDPOINTS.distributorMaster.changeUsername(id),
        method: 'PUT',
        body: newUserName,
        bodyType: 'raw',
        headers: { 'content-type': 'text/plain' },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DistributorAccount', id }],
    }),

    changeDistributorEmail: builder.mutation<void, { id: number; newEmail: string }>({
      query: ({ id, newEmail }) => ({
        url: API_ENDPOINTS.distributorMaster.changeEmail(id),
        method: 'PUT',
        body: newEmail,
        bodyType: 'raw',
        headers: { 'content-type': 'text/plain' },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DistributorAccount', id }],
    }),

    changeDistributorPassword: builder.mutation<void, { id: number; dto: DistributorAccountChangePasswordDTO }>({
      query: ({ id, dto }) => ({
        url: API_ENDPOINTS.distributorMaster.changePassword(id),
        method: 'PUT',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'DistributorAccount', id }],
    }),
  }),
});

// Export hooks
export const {
  useGetDistributorsQuery,
  useGetDistributorQuery,
  useGetDistributorAccountQuery,
  useGetArtistRequestsQuery,
  useGetArtistRequestQuery,
  useCreateDistributorMutation,
  useUpdateDistributorMutation,
  useDeleteDistributorMutation,
  useUpdateDistributorKeyMutation,
  useResolveArtistRequestMutation,
  useRegisterDistributorAccountMutation,
  useDistributorLoginMutation,
  useDistributorRefreshTokenMutation,
  useTerminateDistributorSessionMutation,
  useDistributorRevokeSessionMutation,
  useDistributorRevokeAllSessionsMutation,
  useDeleteDistributorAccountMutation,
  useChangeDistributorUsernameMutation,
  useChangeDistributorEmailMutation,
  useChangeDistributorPasswordMutation,
} = distributionApi;

