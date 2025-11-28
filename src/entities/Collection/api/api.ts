import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    /**
     * @deprecated Use useUpdateCollectionVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (collectionType: string, collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.collection.updateVisibility(collectionType, collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),

    /**
     * @deprecated Use useToggleCollectionFavoriteMutation from @shared/api/rtkApi instead
     */
    toggleFavorite: (collectionType: string, collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.collection.toggleFavorite(collectionType, collectionId), undefined, config),
};

