import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

import type {
SearchAlbumsParams,
SearchAlbumsResultDTO,
SearchArtistsParams,
SearchArtistsResultDTO,
SearchParams,
SearchPlaylistsParams,
SearchPlaylistsResultDTO,
SearchPopularParams,
SearchResultDTO,
SearchSuggestionsParams,
SearchTracksParams,
SearchTracksResultDTO,
SearchUsersParams,
SearchUsersResultDTO,
} from '../model/types';

/**
 * Search API endpoints
 */
export const searchApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    // Main search endpoint
    search: builder.query<SearchResultDTO, SearchParams>({
      providesTags: ['DemoState'],
      query: ({ query, category, limit, offset }) => {
        // Преобразуем категорию в lowercase для бэкенда
        // Бэкенд ожидает: "all", "tracks", "album", "playlist", "artist", "users"
        const backendCategory = category 
          ? category === 'All' 
            ? 'all'
            : category === 'Tracks'
            ? 'tracks'
            : category === 'Albums'
            ? 'album'
            : category === 'Playlists'
            ? 'playlist'
            : category === 'Artists'
            ? 'artist'
            : category === 'Users'
            ? 'users'
            : category.toLowerCase()
          : undefined;
        
        return {
          url: API_ENDPOINTS.search.search,
          method: 'GET',
          params: {
            query,
            ...(backendCategory ? { category: backendCategory } : {}),
            ...(limit !== undefined ? { limit } : {}),
            ...(offset !== undefined ? { offset } : {}),
          },
          withAuth: false, // Опционально для некоторых категорий
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return `search_${queryArgs.query}_${queryArgs.category || 'All'}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    // Search by category
    searchTracks: builder.query<SearchTracksResultDTO, SearchTracksParams>({
      providesTags: ['DemoState'],
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
      serializeQueryArgs: ({ queryArgs }) => {
        // Правильная сериализация ключа запроса для уникальности
        return `searchTracks_${queryArgs.query}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    searchAlbums: builder.query<SearchAlbumsResultDTO, SearchAlbumsParams>({
      providesTags: ['DemoState'],
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
      serializeQueryArgs: ({ queryArgs }) => {
        return `searchAlbums_${queryArgs.query}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    searchPlaylists: builder.query<SearchPlaylistsResultDTO, SearchPlaylistsParams>({
      providesTags: ['DemoState'],
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
      serializeQueryArgs: ({ queryArgs }) => {
        return `searchPlaylists_${queryArgs.query}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    searchArtists: builder.query<SearchArtistsResultDTO, SearchArtistsParams>({
      providesTags: ['DemoState'],
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
      serializeQueryArgs: ({ queryArgs }) => {
        return `searchArtists_${queryArgs.query}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    searchUsers: builder.query<SearchUsersResultDTO, SearchUsersParams>({
      providesTags: ['DemoState'],
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
      serializeQueryArgs: ({ queryArgs }) => {
        return `searchUsers_${queryArgs.query}_${queryArgs.limit || 20}_${queryArgs.offset || 0}`;
      },
    }),

    // Search suggestions
    getSearchSuggestions: builder.query<string[], SearchSuggestionsParams>({
      providesTags: ['DemoState'],
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
      providesTags: ['DemoState'],
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

