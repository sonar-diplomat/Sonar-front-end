import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { PlaylistDTO, CreatePlaylistDTO } from '../model/types';

/**
 * Playlist API endpoints
 */
export const playlistApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlaylist: builder.query<PlaylistDTO, number>({
      query: (playlistId) => ({
        url: API_ENDPOINTS.playlist.byId(playlistId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, playlistId) => [{ type: 'Playlist', id: playlistId }],
    }),

    getPlaylistShareLink: builder.query<string, number>({
      query: (playlistId) => ({
        url: API_ENDPOINTS.playlist.shareLink(playlistId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, playlistId) => [{ type: 'Share', id: `playlist-${playlistId}` }],
    }),

    createPlaylist: builder.mutation<PlaylistDTO, CreatePlaylistDTO>({
      query: (body) => ({
        url: API_ENDPOINTS.playlist.create,
        method: 'POST',
        body,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Playlist', id: 'LIST' }],
    }),

    deletePlaylist: builder.mutation<void, number>({
      query: (playlistId) => ({
        url: API_ENDPOINTS.playlist.delete(playlistId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, playlistId) => [
        { type: 'Playlist', id: playlistId },
        { type: 'Playlist', id: 'LIST' },
      ],
    }),

    updatePlaylistName: builder.mutation<PlaylistDTO, { playlistId: number; newName: string }>({
      query: ({ playlistId, newName }) => ({
        url: API_ENDPOINTS.playlist.updateName(playlistId),
        method: 'PUT',
        params: { newName },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),

    updatePlaylistCover: builder.mutation<void, { playlistId: number; coverFile: File }>({
      query: ({ playlistId, coverFile }) => {
        const fd = new FormData();
        fd.append('coverFile', coverFile);
        return {
          url: API_ENDPOINTS.playlist.updateCover(playlistId),
          method: 'PUT',
          body: fd,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),

    addContributor: builder.mutation<void, { playlistId: number; contributorId: number }>({
      query: ({ playlistId, contributorId }) => ({
        url: API_ENDPOINTS.playlist.addContributor(playlistId, contributorId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),

    removeContributor: builder.mutation<void, { playlistId: number; contributorId: number }>({
      query: ({ playlistId, contributorId }) => ({
        url: API_ENDPOINTS.playlist.removeContributor(playlistId, contributorId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),

    addTrackToPlaylist: builder.mutation<void, { playlistId: number; trackId: number }>({
      query: ({ playlistId, trackId }) => ({
        url: API_ENDPOINTS.playlist.addTrack(playlistId, trackId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [
        { type: 'Playlist', id: playlistId },
        { type: 'Track', id: 'LIST' },
      ],
    }),

    removeTrackFromPlaylist: builder.mutation<void, { playlistId: number; trackId: number }>({
      query: ({ playlistId, trackId }) => ({
        url: API_ENDPOINTS.playlist.removeTrack(playlistId, trackId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [
        { type: 'Playlist', id: playlistId },
        { type: 'Track', id: 'LIST' },
      ],
    }),

    importCollectionToPlaylist: builder.mutation<void, { playlistId: number; collection: string; collectionId: number }>({
      query: ({ playlistId, collection, collectionId }) => ({
        url: API_ENDPOINTS.playlist.importCollection(playlistId, collection, collectionId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),

    updatePlaylistVisibility: builder.mutation<void, { playlistId: number; visibilityStatusId: number }>({
      query: ({ playlistId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.playlist.updateVisibility(playlistId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { playlistId }) => [{ type: 'Playlist', id: playlistId }],
    }),
  }),
});

// Export hooks
export const {
  useGetPlaylistQuery,
  useGetPlaylistShareLinkQuery,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistNameMutation,
  useUpdatePlaylistCoverMutation,
  useAddContributorMutation,
  useRemoveContributorMutation,
  useAddTrackToPlaylistMutation,
  useRemoveTrackFromPlaylistMutation,
  useImportCollectionToPlaylistMutation,
  useUpdatePlaylistVisibilityMutation,
} = playlistApi;

