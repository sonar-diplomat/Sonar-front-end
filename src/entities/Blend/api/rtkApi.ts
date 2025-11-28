import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

/**
 * Blend API endpoints
 */
export const blendApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    updateBlendVisibility: builder.mutation<void, { collectionId: number; visibilityStatusId: number }>({
      query: ({ collectionId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.blend.updateVisibility(collectionId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
    }),

    toggleBlendFavorite: builder.mutation<void, number>({
      query: (collectionId) => ({
        url: API_ENDPOINTS.blend.toggleFavorite(collectionId),
        method: 'POST',
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useUpdateBlendVisibilityMutation,
  useToggleBlendFavoriteMutation,
} = blendApi;

