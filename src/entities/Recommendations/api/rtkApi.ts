import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

import type {
CursorPageDTO,
PopularCollectionDTO,
RecentCollectionDTO,
RecentTrackDTO,
} from '../model/types';

/**
 * Recommendations API endpoints
 */
export const recommendationsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getPopularCollections: builder.query<PopularCollectionDTO[], { limit?: number }>({
      providesTags: ['DemoState'],
      query: ({ limit = 4 }) => ({
        url: API_ENDPOINTS.recommendations.popularCollections,
        method: 'GET',
        params: { limit },
        withAuth: false,
      }),
    }),

    getRecentCollections: builder.query<
      CursorPageDTO<RecentCollectionDTO>,
      { limit?: number; cursor?: string | null }
    >({
      providesTags: ['DemoState'],
      query: ({ limit = 5, cursor }) => ({
        url: API_ENDPOINTS.recommendations.recentCollections,
        method: 'GET',
        params: {
          limit,
          ...(cursor && { cursor }),
        },
        withAuth: true,
      }),
    }),

    getRecentTracks: builder.query<CursorPageDTO<RecentTrackDTO>, { limit?: number; cursor?: string | null }>({
      providesTags: ['DemoState'],
      query: ({ limit = 5, cursor }) => ({
        url: API_ENDPOINTS.recommendations.recentTracks,
        method: 'GET',
        params: {
          limit,
          ...(cursor && { cursor }),
        },
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetPopularCollectionsQuery,
  useGetRecentCollectionsQuery,
  useGetRecentTracksQuery,
} = recommendationsApi;

