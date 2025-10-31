import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { AccessFeatureDTO } from '../model/types.ts';

export const Api = {
    list: () => apiClient.get<AccessFeatureDTO[]>(API_ENDPOINTS.accessFeature.list),
    byId: (id: number) => apiClient.get<AccessFeatureDTO>(API_ENDPOINTS.accessFeature.byId(id)),
    byUserId: (userId: number) =>
        apiClient.get<AccessFeatureDTO[]>(API_ENDPOINTS.accessFeature.byUserId(userId)),
    assign: (userId: number, accessFeatureIds: number[]) =>
        apiClient.post<void>(API_ENDPOINTS.accessFeature.assign(userId), accessFeatureIds),
    revoke: (userId: number, accessFeatureIds: number[]) =>
        apiClient.post<void>(API_ENDPOINTS.accessFeature.revoke(userId), accessFeatureIds),
};
