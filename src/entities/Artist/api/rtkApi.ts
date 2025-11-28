import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { PostDTO } from '../model/types';

/**
 * Artist API endpoints
 */
export const artistApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    registerArtist: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.artist.register,
        method: 'POST',
        withAuth: true,
      }),
    }),

    updateArtistName: builder.mutation<void, { artistId: number; newArtistName: string }>({
      query: ({ artistId, newArtistName }) => ({
        url: API_ENDPOINTS.artist.updateName(artistId),
        method: 'PUT',
        body: newArtistName,
        bodyType: 'raw',
        headers: { 'content-type': 'text/plain' },
        withAuth: true,
      }),
    }),

    deleteArtist: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.artist.delete,
        method: 'DELETE',
        withAuth: true,
      }),
    }),

    createPost: builder.mutation<void, PostDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.artist.createPost,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
    }),

    deletePost: builder.mutation<void, number>({
      query: (postId) => ({
        url: API_ENDPOINTS.artist.deletePost(postId),
        method: 'DELETE',
        withAuth: true,
      }),
    }),

    updatePost: builder.mutation<void, { postId: number; dto: PostDTO }>({
      query: ({ postId, dto }) => ({
        url: API_ENDPOINTS.artist.updatePost(postId),
        method: 'PUT',
        body: dto,
        withAuth: true,
      }),
    }),

    updatePostVisibility: builder.mutation<void, { postId: number; visibilityStatusId: number }>({
      query: ({ postId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.artist.updatePostVisibility(postId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useRegisterArtistMutation,
  useUpdateArtistNameMutation,
  useDeleteArtistMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useUpdatePostVisibilityMutation,
} = artistApi;

