import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';

import type {
PurchaseSubscriptionDTO,
SubscriptionFeatureDTO,
SubscriptionPackDTO,
SubscriptionPaymentDTO,
} from '../model/types';

import { normalizeSubscriptionPack } from './normalizeSubscription';


/**
 * Subscription API endpoints
 */
export const subscriptionApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPacks: builder.query<SubscriptionPackDTO[], void>({
      transformResponse: (response: unknown) => {
        if (!Array.isArray(response)) throw new Error('Invalid subscription pack list');
        return response.map(normalizeSubscriptionPack);
      },
      query: () => ({
        url: API_ENDPOINTS.subscription.packs,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'SubscriptionPack', id: 'LIST' }, 'DemoState'],
    }),

    getSubscriptionPack: builder.query<SubscriptionPackDTO, number>({
      transformResponse: normalizeSubscriptionPack,
      query: (id) => ({
        url: API_ENDPOINTS.subscription.packById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionPack', id }, 'DemoState'],
    }),

    getSubscriptionPayments: builder.query<SubscriptionPaymentDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.subscription.payments,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'SubscriptionPayment', id: 'LIST' }, 'DemoState'],
    }),

    getSubscriptionPayment: builder.query<SubscriptionPaymentDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.subscription.paymentById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionPayment', id }, 'DemoState'],
    }),

    getSubscriptionFeatures: builder.query<SubscriptionFeatureDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.subscription.features,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'SubscriptionFeature', id: 'LIST' }, 'DemoState'],
    }),

    getSubscriptionFeature: builder.query<SubscriptionFeatureDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.subscription.featureById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionFeature', id }, 'DemoState'],
    }),

    purchaseSubscription: builder.mutation<SubscriptionPaymentDTO, PurchaseSubscriptionDTO>({
      query: (body) => ({
        url: API_ENDPOINTS.subscription.purchase,
        method: 'POST',
        body,
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'SubscriptionPayment', id: 'LIST' },
        { type: 'SubscriptionPack', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetSubscriptionPacksQuery,
  useGetSubscriptionPackQuery,
  useGetSubscriptionPaymentsQuery,
  useGetSubscriptionPaymentQuery,
  useGetSubscriptionFeaturesQuery,
  useGetSubscriptionFeatureQuery,
  usePurchaseSubscriptionMutation,
} = subscriptionApi;

