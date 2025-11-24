import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type {
    PurchaseSubscriptionDTO,
    SubscriptionFeatureDTO,
    SubscriptionPackDTO,
    SubscriptionPaymentDTO,
} from '../model/types.ts';

export const Api = {
    // Закомментировано: используйте useGetSubscriptionPacksQuery из @shared/api/rtkApi
    // getPacks: () =>
    //     apiClient.get<SubscriptionPackDTO[]>(API_ENDPOINTS.subscription.packs),
    // Закомментировано: используйте useGetSubscriptionPackByIdQuery из @shared/api/rtkApi
    // getPackById: (id: number) =>
    //     apiClient.get<SubscriptionPackDTO>(API_ENDPOINTS.subscription.packById(id)),
    purchase: (body: PurchaseSubscriptionDTO) =>
        apiClient.post<SubscriptionPaymentDTO>(API_ENDPOINTS.subscription.purchase, body),
    // Закомментировано: используйте useGetSubscriptionPaymentsQuery из @shared/api/rtkApi
    // getPayments: () =>
    //     apiClient.get<SubscriptionPaymentDTO[]>(API_ENDPOINTS.subscription.payments),
    // Закомментировано: используйте useGetSubscriptionPaymentByIdQuery из @shared/api/rtkApi
    // getPaymentById: (id: number) =>
    //     apiClient.get<SubscriptionPaymentDTO>(API_ENDPOINTS.subscription.paymentById(id)),
    // Закомментировано: используйте useGetSubscriptionFeaturesQuery из @shared/api/rtkApi
    // getFeatures: () =>
    //     apiClient.get<SubscriptionFeatureDTO[]>(API_ENDPOINTS.subscription.features),
    // Закомментировано: используйте useGetSubscriptionFeatureByIdQuery из @shared/api/rtkApi
    // getFeatureById: (id: number) =>
    //     apiClient.get<SubscriptionFeatureDTO>(API_ENDPOINTS.subscription.featureById(id)),
};
