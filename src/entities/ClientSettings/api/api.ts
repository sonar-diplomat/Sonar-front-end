import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { Settings } from '../model/types/Settings';
import type { RequestConfig } from '@shared/types';

export const Api = {
    // Закомментировано: используйте useGetClientSettingsQuery из @shared/api/rtkApi
    // get: (config?: RequestConfig) =>
    //     apiClient.get<Settings>(API_ENDPOINTS.clientSettings.get, config),

    patch: (updates: Record<string, unknown>, config?: RequestConfig) =>
        apiClient.patch<Settings>(API_ENDPOINTS.clientSettings.patch, updates, {
            ...config,
            bodyType: 'json',
        }),
};

