import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    /**
     * @deprecated Use useUpdateCurrentPositionMutation from @shared/api/rtkApi instead
     */
    updateCurrentPosition: (position: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateCurrentPosition, position, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    /**
     * @deprecated Use useUpdateListeningTargetMutation from @shared/api/rtkApi instead
     */
    updateListeningTarget: (trackId: number, collectionId?: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateListeningTarget(trackId, collectionId), undefined, config),

    /**
     * @deprecated Use useAddToQueueMutation from @shared/api/rtkApi instead
     */
    addToQueue: (config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.userState.addToQueue, undefined, config),

    /**
     * @deprecated Use useDeleteFromQueueMutation from @shared/api/rtkApi instead
     */
    deleteFromQueue: (config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.userState.deleteFromQueue, config),

    /**
     * @deprecated Use useUpdateUserStatusMutation from @shared/api/rtkApi instead
     */
    updateStatus: (statusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.userState.updateStatus(statusId), undefined, config),

    /**
     * @deprecated Use useUpdatePrimarySessionMutation from @shared/api/rtkApi instead
     */
    updatePrimarySession: (config?: RequestConfig) =>
        apiClient.patch<void>(API_ENDPOINTS.userState.updatePrimarySession, undefined, config),
};

