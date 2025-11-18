import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    updateCurrentPosition: (position: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateCurrentPosition, position, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    updateListeningTarget: (trackId: number, collectionId?: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateListeningTarget(trackId, collectionId), undefined, config),

    addToQueue: (config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.userState.addToQueue, undefined, config),

    deleteFromQueue: (config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.userState.deleteFromQueue, config),

    updateStatus: (statusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateStatus(statusId), undefined, config),

    updatePrimarySession: (config?: RequestConfig) =>
        apiClient.patch<void>(API_ENDPOINTS.userState.updatePrimarySession, undefined, config),
};

