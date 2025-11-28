import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { ShareLinkDTO } from '@entities/Collection';

/**
 * Share API endpoints
 */
export const shareApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getShareLink: builder.query<ShareLinkDTO, { entityType: string; entityId: number }>({
      query: ({ entityType, entityId }) => ({
        url: API_ENDPOINTS.share.link(entityType, entityId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, { entityType, entityId }) => [
        { type: 'Share', id: `${entityType}-${entityId}` },
      ],
    }),

    getShareQr: builder.query<string, { entityType: string; entityId: number }>({
      query: ({ entityType, entityId }) => ({
        url: API_ENDPOINTS.share.qr(entityType, entityId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, { entityType, entityId }) => [
        { type: 'Share', id: `${entityType}-${entityId}-qr` },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetShareLinkQuery,
  useGetShareQrQuery,
} = shareApi;

