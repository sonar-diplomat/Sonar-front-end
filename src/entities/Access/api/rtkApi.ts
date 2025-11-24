import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { AccessFeatureDTO } from '../model/types';

/**
 * Access API endpoints
 */
export const accessApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccessFeatures: builder.query<AccessFeatureDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.accessFeature.list,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'AccessFeature', id: 'LIST' }],
    }),

    getAccessFeatureById: builder.query<AccessFeatureDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.accessFeature.byId(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'AccessFeature', id }],
    }),

    getUserAccessFeatures: builder.query<AccessFeatureDTO[], number>({
      query: (userId) => ({
        url: API_ENDPOINTS.accessFeature.byUserId(userId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'AccessFeature', id: `user-${userId}` }],
    }),

    assignAccessFeatures: builder.mutation<void, { userId: number; accessFeatureIds: number[] }>({
      query: ({ userId, accessFeatureIds }) => ({
        url: API_ENDPOINTS.accessFeature.assign(userId),
        method: 'POST',
        body: accessFeatureIds,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'AccessFeature', id: `user-${userId}` }],
    }),

    revokeAccessFeatures: builder.mutation<void, { userId: number; accessFeatureIds: number[] }>({
      query: ({ userId, accessFeatureIds }) => ({
        url: API_ENDPOINTS.accessFeature.revoke(userId),
        method: 'POST',
        body: accessFeatureIds,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'AccessFeature', id: `user-${userId}` }],
    }),
  }),
});

// Export hooks
export const {
  useGetAccessFeaturesQuery,
  useGetAccessFeatureByIdQuery,
  useGetUserAccessFeaturesQuery,
  useAssignAccessFeaturesMutation,
  useRevokeAccessFeaturesMutation,
} = accessApi;

