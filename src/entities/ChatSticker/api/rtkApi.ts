import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { ChatStickerDTO } from '../model/types';

export const chatStickerApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatStickers: builder.query<ChatStickerDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.chatSticker.list,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'ChatSticker', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetChatStickersQuery,
} = chatStickerApi;

