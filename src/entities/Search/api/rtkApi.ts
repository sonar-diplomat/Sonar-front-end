import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  SearchResultDTO,
  SearchTracksResultDTO,
  SearchAlbumsResultDTO,
  SearchPlaylistsResultDTO,
  SearchArtistsResultDTO,
  SearchUsersResultDTO,
  SearchParams,
  SearchTracksParams,
  SearchAlbumsParams,
  SearchPlaylistsParams,
  SearchArtistsParams,
  SearchUsersParams,
  SearchSuggestionsParams,
  SearchPopularParams,
} from '../model/types';

/**
 * Search API endpoints
 */
export const searchApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    // Main search endpoint
    search: builder.query<SearchResultDTO, SearchParams>({
      query: ({ query, category, limit, offset }) => ({
        url: API_ENDPOINTS.search.search,
        method: 'GET',
        params: {
          query,
          ...(category ? { category } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false, // Опционально для некоторых категорий
      }),
    }),

    // Search by category
    searchTracks: builder.query<SearchTracksResultDTO, SearchTracksParams>({
      query: ({ query, limit, offset }) => ({
        url: API_ENDPOINTS.search.tracks,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false,
      }),
    }),

    searchAlbums: builder.query<SearchAlbumsResultDTO, SearchAlbumsParams>({
      query: ({ query, limit, offset }) => ({
        url: API_ENDPOINTS.search.albums,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false,
      }),
    }),

    searchPlaylists: builder.query<SearchPlaylistsResultDTO, SearchPlaylistsParams>({
      query: ({ query, limit, offset }) => ({
        url: API_ENDPOINTS.search.playlists,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false,
      }),
    }),

    searchArtists: builder.query<SearchArtistsResultDTO, SearchArtistsParams>({
      query: ({ query, limit, offset }) => ({
        url: API_ENDPOINTS.search.artists,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false,
      }),
    }),

    searchUsers: builder.query<SearchUsersResultDTO, SearchUsersParams>({
      query: ({ query, limit, offset }) => ({
        url: API_ENDPOINTS.search.users,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
          ...(offset !== undefined ? { offset } : {}),
        },
        withAuth: false,
      }),
    }),

    // Search suggestions
    getSearchSuggestions: builder.query<string[], SearchSuggestionsParams>({
      query: ({ query, limit }) => ({
        url: API_ENDPOINTS.search.suggestions,
        method: 'GET',
        params: {
          query,
          ...(limit !== undefined ? { limit } : {}),
        },
        withAuth: false,
      }),
    }),

    // Popular queries
    getPopularQueries: builder.query<string[], SearchPopularParams>({
      query: ({ limit } = {}) => ({
        url: API_ENDPOINTS.search.popular,
        method: 'GET',
        params: {
          ...(limit !== undefined ? { limit } : {}),
        },
        withAuth: false,
      }),
    }),
  }),
});

// Export hooks
export const {
  useSearchQuery,
  useSearchTracksQuery,
  useSearchAlbumsQuery,
  useSearchPlaylistsQuery,
  useSearchArtistsQuery,
  useSearchUsersQuery,
  useGetSearchSuggestionsQuery,
  useGetPopularQueriesQuery,
  useLazySearchQuery,
  useLazySearchTracksQuery,
  useLazySearchAlbumsQuery,
  useLazySearchPlaylistsQuery,
  useLazySearchArtistsQuery,
  useLazySearchUsersQuery,
  useLazyGetSearchSuggestionsQuery,
  useLazyGetPopularQueriesQuery,
} = searchApi;

