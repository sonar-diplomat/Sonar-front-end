import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    updateVisibility: (collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.blend.updateVisibility(collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),

    toggleFavorite: (collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.blend.toggleFavorite(collectionId), undefined, config),
};

