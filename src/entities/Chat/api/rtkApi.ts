import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { ChatDTO, MessageDTO, CreateChatDTO } from '../model/types';
import type { CursorPageDTO } from '@entities/Playlist';

/**
 * Chat API endpoints
 */
export const chatApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessage: builder.query<MessageDTO, number>({
      query: (messageId) => ({
        url: API_ENDPOINTS.chat.getMessage(messageId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, messageId) => [{ type: 'Message', id: messageId }],
    }),

    getChatInfo: builder.query<ChatDTO, number>({
      query: (chatId) => ({
        url: API_ENDPOINTS.chat.getInfo(chatId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, chatId) => [{ type: 'Chat', id: chatId }],
    }),

    getChatMessages: builder.query<
      CursorPageDTO<MessageDTO>,
      { chatId: number; cursor?: number | null; take?: number }
    >({
      query: ({ chatId, cursor, take }) => ({
        url: API_ENDPOINTS.chat.getMessages(chatId),
        method: 'GET',
        withAuth: true,
        params: {
          ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
          ...(take !== undefined ? { take } : {}),
        },
      }),
      providesTags: (_result, _error, { chatId }) => [{ type: 'Message', id: `chat-${chatId}` }],
    }),

    createChat: builder.mutation<void, CreateChatDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.chat.create,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Chat', id: 'LIST' }],
    }),

    sendMessage: builder.mutation<void, { chatId: number; message: MessageDTO }>({
      query: ({ chatId, message }) => ({
        url: API_ENDPOINTS.chat.sendMessage(chatId),
        method: 'POST',
        body: message,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Message', id: `chat-${chatId}` },
        { type: 'Chat', id: chatId },
      ],
    }),

    deleteMessage: builder.mutation<void, number>({
      query: (messageId) => ({
        url: API_ENDPOINTS.chat.deleteMessage(messageId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, messageId) => [{ type: 'Message', id: messageId }],
    }),

    addUserToChat: builder.mutation<void, { chatId: number; userId: number }>({
      query: ({ chatId, userId }) => ({
        url: API_ENDPOINTS.chat.addUser(chatId, userId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),

    leaveChat: builder.mutation<void, number>({
      query: (chatId) => ({
        url: API_ENDPOINTS.chat.leave(chatId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, chatId) => [{ type: 'Chat', id: chatId }],
    }),

    removeUserFromChat: builder.mutation<void, { chatId: number; userId: number }>({
      query: ({ chatId, userId }) => ({
        url: API_ENDPOINTS.chat.removeUser(chatId, userId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),

    updateChatCover: builder.mutation<void, { chatId: number; file: File }>({
      query: ({ chatId, file }) => {
        const fd = new FormData();
        fd.append('file', file);
        return {
          url: API_ENDPOINTS.chat.updateCover(chatId),
          method: 'PUT',
          body: fd,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),

    updateChatName: builder.mutation<void, { chatId: number; newName: string }>({
      query: ({ chatId, newName }) => ({
        url: API_ENDPOINTS.chat.updateName(chatId),
        method: 'PUT',
        params: { newName },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Chat', id: chatId }],
    }),

    readMessages: builder.mutation<void, { chatId: number; messageIds: number[] }>({
      query: ({ chatId, messageIds }) => ({
        url: API_ENDPOINTS.chat.readMessages(chatId),
        method: 'PUT',
        body: messageIds,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { chatId }) => [{ type: 'Message', id: `chat-${chatId}` }],
    }),

    readAllMessages: builder.mutation<void, number>({
      query: (chatId) => ({
        url: API_ENDPOINTS.chat.readAllMessages(chatId),
        method: 'PUT',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, chatId) => [{ type: 'Message', id: `chat-${chatId}` }],
    }),
  }),
});

// Export hooks
export const {
  useGetMessageQuery,
  useGetChatInfoQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useAddUserToChatMutation,
  useLeaveChatMutation,
  useRemoveUserFromChatMutation,
  useUpdateChatCoverMutation,
  useUpdateChatNameMutation,
  useReadMessagesMutation,
  useReadAllMessagesMutation,
} = chatApi;

