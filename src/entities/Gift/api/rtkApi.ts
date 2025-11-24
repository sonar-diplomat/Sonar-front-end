import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { GiftResponseDTO, GiftStyleDTO, SendGiftDTO } from '../model/types';

/**
 * Gift API endpoints
 */
export const giftApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivedGifts: builder.query<GiftResponseDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.gift.received,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Gift', id: 'RECEIVED' }],
    }),

    getSentGifts: builder.query<GiftResponseDTO[], { senderId?: number }>({
      query: ({ senderId }) => ({
        url: API_ENDPOINTS.gift.sent,
        method: 'GET',
        withAuth: true,
        params: senderId ? { senderId } : undefined,
      }),
      providesTags: [{ type: 'Gift', id: 'SENT' }],
    }),

    getGift: builder.query<GiftResponseDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Gift', id }],
    }),

    getGiftStyles: builder.query<GiftStyleDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.gift.styles,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'GiftStyle', id: 'LIST' }],
    }),

    getGiftStyleById: builder.query<GiftStyleDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.styleById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'GiftStyle', id }],
    }),

    sendGift: builder.mutation<void, SendGiftDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.gift.send,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Gift', id: 'RECEIVED' }, { type: 'Gift', id: 'SENT' }],
    }),

    acceptGift: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.accept(id),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Gift', id },
        { type: 'Gift', id: 'RECEIVED' },
      ],
    }),

    cancelGift: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.cancel(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Gift', id },
        { type: 'Gift', id: 'SENT' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetReceivedGiftsQuery,
  useGetSentGiftsQuery,
  useGetGiftQuery,
  useGetGiftStylesQuery,
  useGetGiftStyleByIdQuery,
  useSendGiftMutation,
  useAcceptGiftMutation,
  useCancelGiftMutation,
} = giftApi;

