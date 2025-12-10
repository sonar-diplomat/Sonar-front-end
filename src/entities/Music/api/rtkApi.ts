import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { TrackDTO, UpdateTrackDTO, UpdateTrackFileDTO } from '../model/types';

/**
 * Music (Track) API endpoints
 */
export const musicApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrack: builder.query<TrackDTO, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.track.byId(trackId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, trackId) => [{ type: 'Track', id: trackId }],
    }),

    updateTrack: builder.mutation<TrackDTO, { trackId: number; body: UpdateTrackDTO }>({
      query: ({ trackId, body }) => ({
        url: API_ENDPOINTS.track.update(trackId),
        method: 'PUT',
        body,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { trackId }) => [{ type: 'Track', id: trackId }],
    }),

    updateTrackFile: builder.mutation<void, { trackId: number; body: UpdateTrackFileDTO }>({
      query: ({ trackId, body }) => {
        const fd = new FormData();
        fd.append('PlaybackQualityId', String(body.playbackQualityId));
        fd.append('File', body.file);
        return {
          url: API_ENDPOINTS.track.updateFile(trackId),
          method: 'PUT',
          body: fd,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: (_result, _error, { trackId }) => [{ type: 'Track', id: trackId }],
    }),

    deleteTrack: builder.mutation<void, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.track.delete(trackId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, trackId) => [
        { type: 'Track', id: trackId },
        { type: 'Track', id: 'LIST' },
      ],
    }),

    updateTrackVisibility: builder.mutation<void, { trackId: number; visibilityStatusId: number }>({
      query: ({ trackId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.track.updateVisibility(trackId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { trackId }) => [{ type: 'Track', id: trackId }],
    }),

    toggleTrackFavorite: builder.mutation<void, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.track.toggleFavorite(trackId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, trackId) => [
        { type: 'Track', id: trackId },
        { type: 'Track', id: 'LIST' },
      ],
      async onQueryStarted(trackId, { dispatch, queryFulfilled }) { 
        const patchResult = dispatch(
          musicApi.util.updateQueryData('getTrack', trackId, (draft) => {
            if (draft) {
              draft.isFavorite = !draft.isFavorite;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// Export hooks
export const {
  useGetTrackQuery,
  useUpdateTrackMutation,
  useUpdateTrackFileMutation,
  useDeleteTrackMutation,
  useUpdateTrackVisibilityMutation,
  useToggleTrackFavoriteMutation,
} = musicApi;

