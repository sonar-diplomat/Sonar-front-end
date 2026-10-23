import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

export type { QueueDTO, QueueTrackDTO } from './normalizeQueue';
import {normalizeQueue} from './normalizeQueue';
import type {QueueDTO} from './normalizeQueue';

/*
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

    getQueue: builder.query<QueueDTO | null, void>({
      query: () => ({
        url: API_ENDPOINTS.userState.getQueue,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: ['Queue', 'DemoState'],
      transformResponse: normalizeQueue,
    }),

    addToQueue: builder.mutation<void, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.userState.addToQueue,
        method: 'POST',
        body: trackId,
        withAuth: true,
      }),
      invalidatesTags: ['Queue'],
    }),

    deleteFromQueue: builder.mutation<void, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.userState.deleteFromQueue,
        method: 'DELETE',
        body: trackId,
        withAuth: true,
      }),
      invalidatesTags: ['Queue'],
    }),

    saveQueue: builder.mutation<void, number[]>({
      query: (trackIds) => ({
        url: API_ENDPOINTS.userState.saveQueue,
        method: 'PUT',
        body: trackIds,
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
  useGetQueueQuery,
  useAddToQueueMutation,
  useDeleteFromQueueMutation,
  useSaveQueueMutation,
  useUpdateUserStatusMutation,
  useUpdatePrimarySessionMutation,
} = userStateApi;

