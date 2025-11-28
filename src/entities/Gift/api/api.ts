import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { GiftResponseDTO, GiftStyleDTO, SendGiftDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';
import type { SubscriptionPaymentDTO } from '@entities/Subscription';

export const Api = {
    /**
     * @deprecated Use useSendGiftMutation from @shared/api/rtkApi instead
     */
    send: (dto: SendGiftDTO, config?: RequestConfig) =>
        apiClient.post<GiftResponseDTO>(API_ENDPOINTS.gift.send, dto, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useAcceptGiftMutation from @shared/api/rtkApi instead
     */
    accept: (id: number, config?: RequestConfig) =>
        apiClient.post<SubscriptionPaymentDTO>(API_ENDPOINTS.gift.accept(id), undefined, config),

    // Закомментировано: используйте useGetReceivedGiftsQuery из @shared/api/rtkApi
    // received: (config?: RequestConfig) =>
    //     apiClient.get<GiftResponseDTO[]>(API_ENDPOINTS.gift.received, config),

    // Закомментировано: используйте useGetSentGiftsQuery из @shared/api/rtkApi
    // sent: (senderId?: number, config?: RequestConfig) =>
    //     apiClient.get<GiftResponseDTO[]>(API_ENDPOINTS.gift.sent, {
    //         ...config,
    //         params: { ...(config?.params ?? {}), ...(senderId ? { senderId } : {}) },
    //     }),

    // Закомментировано: используйте useGetGiftQuery из @shared/api/rtkApi
    // byId: (id: number, config?: RequestConfig) =>
    //     apiClient.get<GiftResponseDTO>(API_ENDPOINTS.gift.byId(id), config),

    /**
     * @deprecated Use useCancelGiftMutation from @shared/api/rtkApi instead
     */
    cancel: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.gift.cancel(id), config),

    // Закомментировано: используйте useGetGiftStylesQuery из @shared/api/rtkApi
    // styles: (config?: RequestConfig) =>
    //     apiClient.get<GiftStyleDTO[]>(API_ENDPOINTS.gift.styles, config),

    // Закомментировано: используйте useGetGiftStyleByIdQuery из @shared/api/rtkApi
    // styleById: (id: number, config?: RequestConfig) =>
    //     apiClient.get<GiftStyleDTO>(API_ENDPOINTS.gift.styleById(id), config),
};

