import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { TrackDTO } from '@entities/Music';

export interface QueueTrackDTO {
  Id: number;
  QueueId: number;
  TrackId: number;
  Order: number;
  IsManuallyAdded: boolean;
  Track: TrackDTO;
}

export interface QueueDTO {
  Id: number;
  Position: string | null;
  CollectionId: number | null;
  CurrentTrackId: number | null;
  QueueTracks: QueueTrackDTO[];
}

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
      providesTags: ['Queue'],
      transformResponse: (response: any) => {
        if (!response) {
          return null;
        }

        if (typeof response === 'string') {
          try {
            response = JSON.parse(response);
          } catch (e) {
            console.error('[getQueue] Failed to parse string response:', e);
            return null;
          }
        }

        if (response.QueueTracks && Array.isArray(response.QueueTracks)) {
          return response as QueueDTO;
        }

        if (response.queueTracks && Array.isArray(response.queueTracks)) {
          return {
            Id: response.id || response.Id,
            Position: response.position || response.Position,
            CollectionId: response.collectionId || response.CollectionId,
            CurrentTrackId: response.currentTrackId || response.CurrentTrackId,
            QueueTracks: response.queueTracks,
          } as QueueDTO;
        }

        if (response.Tracks && Array.isArray(response.Tracks)) {
          return response as QueueDTO;
        }

        if (response.tracks && Array.isArray(response.tracks)) {
          return {
            Id: response.id || response.Id,
            Position: response.position || response.Position,
            CollectionId: response.collectionId || response.CollectionId,
            CurrentTrackId: response.currentTrackId || response.CurrentTrackId,
            QueueTracks: response.tracks.map((track: TrackDTO, index: number) => ({
              Id: index,
              QueueId: response.id || response.Id || 0,
              TrackId: track.id,
              Order: index,
              IsManuallyAdded: false,
              Track: track,
            })),
          } as QueueDTO;
        }

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

