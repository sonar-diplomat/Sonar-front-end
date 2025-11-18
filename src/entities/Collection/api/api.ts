import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    updateVisibility: (collectionType: string, collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.collection.updateVisibility(collectionType, collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),

    toggleFavorite: (collectionType: string, collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.collection.toggleFavorite(collectionType, collectionId), undefined, config),
};

