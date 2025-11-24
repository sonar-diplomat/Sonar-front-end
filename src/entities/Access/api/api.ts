import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { AccessFeatureDTO } from '../model/types.ts';

export const Api = {
    // Закомментировано: используйте useGetAccessFeaturesQuery из @shared/api/rtkApi
    // list: () => apiClient.get<AccessFeatureDTO[]>(API_ENDPOINTS.accessFeature.list),
    // Закомментировано: используйте useGetAccessFeatureByIdQuery из @shared/api/rtkApi
    // byId: (id: number) => apiClient.get<AccessFeatureDTO>(API_ENDPOINTS.accessFeature.byId(id)),
    // Закомментировано: используйте useGetUserAccessFeaturesQuery из @shared/api/rtkApi
    // byUserId: (userId: number) =>
    //     apiClient.get<AccessFeatureDTO[]>(API_ENDPOINTS.accessFeature.byUserId(userId)),
    assign: (userId: number, accessFeatureIds: number[]) =>
        apiClient.post<void>(API_ENDPOINTS.accessFeature.assign(userId), accessFeatureIds),
    revoke: (userId: number, accessFeatureIds: number[]) =>
        apiClient.post<void>(API_ENDPOINTS.accessFeature.revoke(userId), accessFeatureIds),
};
