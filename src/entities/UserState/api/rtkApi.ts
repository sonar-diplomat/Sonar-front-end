import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { TrackDTO } from '@entities/Music';

export interface QueueDTO {
  Id: number;
  Position: string;
  CollectionId: number | null;
  CurrentTrackId: number | null;
  Tracks: TrackDTO[];
}

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

    getQueue: builder.query<QueueDTO | null, void>({
      query: () => ({
        url: API_ENDPOINTS.userState.getQueue,
        method: 'GET',
        withAuth: true,
      }),
      transformResponse: (response: any) => {
        console.log('[getQueue] Raw response type:', typeof response);
        console.log('[getQueue] Raw response:', response);

        if (!response) {
          console.log('[getQueue] Response is null or undefined');
          return null;
        }

        if (typeof response === 'string') {
          try {
            console.log('[getQueue] Response is a string, attempting to parse...');
            const parsed = JSON.parse(response);
            console.log('[getQueue] Parsed response:', parsed);

            if (parsed && parsed.tracks && Array.isArray(parsed.tracks)) {
              console.log('[getQueue] Parsed response has valid tracks array:', parsed.tracks.length);
              return {
                Id: parsed.id,
                Position: parsed.position,
                CollectionId: parsed.collectionId,
                CurrentTrackId: parsed.currentTrackId,
                Tracks: parsed.tracks,
              } as QueueDTO;
            }
            return null;
          } catch (e) {
            console.error('[getQueue] Failed to parse string response:', e);
            return null;
          }
        }

        if (response.tracks && Array.isArray(response.tracks)) {
          console.log('[getQueue] Response has valid tracks array (camelCase):', response.tracks.length);
          return {
            Id: response.id,
            Position: response.position,
            CollectionId: response.collectionId,
            CurrentTrackId: response.currentTrackId,
            Tracks: response.tracks,
          } as QueueDTO;
        }

        if (response.Tracks && Array.isArray(response.Tracks)) {
          console.log('[getQueue] Response has valid Tracks array (PascalCase):', response.Tracks.length);
          return response as QueueDTO;
        }

        console.log('[getQueue] Invalid response structure - no valid tracks/Tracks array');
        return null;
      },
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

