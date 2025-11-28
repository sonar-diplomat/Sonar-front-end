import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

/**
 * UserState API endpoints
 */
export const userStateApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    updateCurrentPosition: builder.mutation<void, string>({
      query: (position) => ({
        url: API_ENDPOINTS.userState.updateCurrentPosition,
        method: 'PUT',
        body: position,
        bodyType: 'raw',
        headers: { 'content-type': 'text/plain' },
        withAuth: true,
      }),
    }),

    updateListeningTarget: builder.mutation<void, { trackId: number; collectionId?: number }>({
      query: ({ trackId, collectionId }) => ({
        url: API_ENDPOINTS.userState.updateListeningTarget(trackId, collectionId),
        method: 'PUT',
        withAuth: true,
      }),
    }),

    addToQueue: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.userState.addToQueue,
        method: 'POST',
        withAuth: true,
      }),
    }),

    deleteFromQueue: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.userState.deleteFromQueue,
        method: 'DELETE',
        withAuth: true,
      }),
    }),

    updateUserStatus: builder.mutation<void, number>({
      query: (statusId) => ({
        url: API_ENDPOINTS.userState.updateStatus(statusId),
        method: 'PUT',
        withAuth: true,
      }),
    }),

    updatePrimarySession: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.userState.updatePrimarySession,
        method: 'PATCH',
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useUpdateCurrentPositionMutation,
  useUpdateListeningTargetMutation,
  useAddToQueueMutation,
  useDeleteFromQueueMutation,
  useUpdateUserStatusMutation,
  useUpdatePrimarySessionMutation,
} = userStateApi;

