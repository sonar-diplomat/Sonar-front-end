import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { RequestConfig } from '@shared/types';

export const Api = {
    // Закомментировано: используйте useGetShareLinkQuery из @shared/api/rtkApi
    // link: (entityType: string, entityId: number, config?: RequestConfig) =>
    //     apiClient.get<string>(API_ENDPOINTS.share.link(entityType, entityId), config),

    // Закомментировано: используйте useGetShareQrQuery из @shared/api/rtkApi
    // qr: (entityType: string, entityId: number, config?: RequestConfig) =>
    //     apiClient.get<string>(API_ENDPOINTS.share.qr(entityType, entityId), config),
};

