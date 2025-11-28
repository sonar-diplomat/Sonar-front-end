import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    /**
     * @deprecated Use useUpdateBlendVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.blend.updateVisibility(collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),

    /**
     * @deprecated Use useToggleBlendFavoriteMutation from @shared/api/rtkApi instead
     */
    toggleFavorite: (collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.blend.toggleFavorite(collectionId), undefined, config),
};

