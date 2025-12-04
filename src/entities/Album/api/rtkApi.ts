import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { AlbumDTO, UploadAlbumDTO } from '../model/types';

/**
 * Album API endpoints
 */
export const albumApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlbumShareLink: builder.query<string, number>({
      query: (albumId) => ({
        url: API_ENDPOINTS.album.shareLink(albumId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, albumId) => [{ type: 'Share', id: `album-${albumId}` }],
    }),

    uploadAlbum: builder.mutation<AlbumDTO, UploadAlbumDTO>({
      query: (body) => ({
        url: API_ENDPOINTS.album.upload,
        method: 'POST',
        body: body as unknown as BodyInit,
        bodyType: 'form',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Album', id: 'LIST' }],
    }),

    deleteAlbum: builder.mutation<void, number>({
      query: (albumId) => ({
        url: API_ENDPOINTS.album.delete(albumId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, albumId) => [
        { type: 'Album', id: albumId },
        { type: 'Album', id: 'LIST' },
      ],
    }),

    updateAlbumName: builder.mutation<AlbumDTO, { albumId: number; name: string }>({
      query: ({ albumId, name }) => ({
        url: API_ENDPOINTS.album.updateName(albumId),
        method: 'PUT',
        params: { name },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { albumId }) => [{ type: 'Album', id: albumId }],
    }),

    addTrackToAlbum: builder.mutation<void, { albumId: number; body: unknown }>({
      query: ({ albumId, body }) => ({
        url: API_ENDPOINTS.album.addTrack(albumId),
        method: 'POST',
        body: body as BodyInit,
        bodyType: 'form',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { albumId }) => [{ type: 'Album', id: albumId }],
    }),

    updateAlbumCover: builder.mutation<void, { albumId: number; file: File }>({
      query: ({ albumId, file }) => {
        const fd = new FormData();
        fd.append('file', file);
        return {
          url: API_ENDPOINTS.album.updateCover(albumId),
          method: 'PUT',
          body: fd,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: (_result, _error, { albumId }) => [{ type: 'Album', id: albumId }],
    }),

    updateAlbumVisibility: builder.mutation<void, { albumId: number; visibilityStatusId: number }>({
      query: ({ albumId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.album.updateVisibility(albumId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { albumId }) => [{ type: 'Album', id: albumId }],
    }),

    getAlbumTracks: builder.query<TrackDTO[], number>({
      query: (albumId) => ({
        url: API_ENDPOINTS.album.tracks(albumId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, albumId) => [{ type: 'Album', id: albumId }, { type: 'Track', id: 'LIST' }],
    }),
  }),
});

// Export hooks
export const {
  useGetAlbumShareLinkQuery,
  useUploadAlbumMutation,
  useDeleteAlbumMutation,
  useUpdateAlbumNameMutation,
  useAddTrackToAlbumMutation,
  useUpdateAlbumCoverMutation,
  useUpdateAlbumVisibilityMutation,
  useGetAlbumTracksQuery,
} = albumApi;

