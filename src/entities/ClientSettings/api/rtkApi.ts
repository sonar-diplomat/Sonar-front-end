import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { Settings } from '../model/types/Settings';
import type { Language } from '../model/types/Language';
import type { Theme } from '../model/types/Theme';
import type { PlaybackQuality } from '@entities/ClientSettings';

/**
 * ClientSettings API endpoints
 */
export const clientSettingsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientSettings: builder.query<Settings, void>({
      query: () => ({
        url: API_ENDPOINTS.clientSettings.get,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ClientSettings', id: 'CURRENT' }],
    }),

    patchClientSettings: builder.mutation<Settings, Record<string, unknown>>({
      query: (updates) => ({
        url: API_ENDPOINTS.clientSettings.patch,
        method: 'PATCH',
        body: updates,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'ClientSettings', id: 'CURRENT' }],
    }),

    getLanguages: builder.query<Language[], void>({
      query: () => ({
        url: API_ENDPOINTS.clientSettings.languages,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'Language', id: 'LIST' }],
    }),

    getThemes: builder.query<Theme[], void>({
      query: () => ({
        url: API_ENDPOINTS.clientSettings.themes,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'Theme', id: 'LIST' }],
    }),

    getPlaybackQualities: builder.query<PlaybackQuality[], void>({
      query: () => ({
        url: API_ENDPOINTS.clientSettings.playbackQualities,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'PlaybackQuality', id: 'LIST' }],
    }),
  }),
});

// Export hooks
export const {
  useGetClientSettingsQuery,
  usePatchClientSettingsMutation,
  useGetLanguagesQuery,
  useGetThemesQuery,
  useGetPlaybackQualitiesQuery,
} = clientSettingsApi;

