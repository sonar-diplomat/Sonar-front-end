import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

/**
 * Collection API endpoints
 */
export const collectionApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    updateCollectionVisibility: builder.mutation<void, { collectionType: string; collectionId: number; visibilityStatusId: number }>({
      query: ({ collectionType, collectionId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.collection.updateVisibility(collectionType, collectionId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
    }),

    toggleCollectionFavorite: builder.mutation<void, { collectionType: string; collectionId: number }>({
      query: ({ collectionType, collectionId }) => ({
        url: API_ENDPOINTS.collection.toggleFavorite(collectionType, collectionId),
        method: 'POST',
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useUpdateCollectionVisibilityMutation,
  useToggleCollectionFavoriteMutation,
} = collectionApi;

