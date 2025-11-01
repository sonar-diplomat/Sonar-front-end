import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type {
    PurchaseSubscriptionDTO,
    SubscriptionFeatureDTO,
    SubscriptionPackDTO,
    SubscriptionPaymentDTO,
} from '../model/types.ts';

export const Api = {
    getPacks: () =>
        apiClient.get<SubscriptionPackDTO[]>(API_ENDPOINTS.subscription.packs),
    getPackById: (id: number) =>
        apiClient.get<SubscriptionPackDTO>(API_ENDPOINTS.subscription.packById(id)),
    purchase: (body: PurchaseSubscriptionDTO) =>
        apiClient.post<SubscriptionPaymentDTO>(API_ENDPOINTS.subscription.purchase, body),
    getPayments: () =>
        apiClient.get<SubscriptionPaymentDTO[]>(API_ENDPOINTS.subscription.payments),
    getPaymentById: (id: number) =>
        apiClient.get<SubscriptionPaymentDTO>(API_ENDPOINTS.subscription.paymentById(id)),
    getFeatures: () =>
        apiClient.get<SubscriptionFeatureDTO[]>(API_ENDPOINTS.subscription.features),
    getFeatureById: (id: number) =>
        apiClient.get<SubscriptionFeatureDTO>(API_ENDPOINTS.subscription.featureById(id)),
};
