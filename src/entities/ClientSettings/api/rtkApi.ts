import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { Settings } from '../model/types';

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
  }),
});

// Export hooks
export const {
  useGetClientSettingsQuery,
  usePatchClientSettingsMutation,
} = clientSettingsApi;

