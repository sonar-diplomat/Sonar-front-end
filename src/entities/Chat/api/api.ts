import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { ChatDTO, CreateChatDTO, MessageDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';
import type { CursorPageDTO } from '@entities/Playlist';

export const Api = {
    /**
     * @deprecated Use useCreateChatMutation from @shared/api/rtkApi instead
     */
    create: (dto: CreateChatDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.create, dto, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useSendMessageMutation from @shared/api/rtkApi instead
     */
    sendMessage: (chatId: number, message: MessageDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.sendMessage(chatId), message, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useDeleteMessageMutation from @shared/api/rtkApi instead
     */
    deleteMessage: (messageId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.chat.deleteMessage(messageId), config),

    // Закомментировано: используйте useGetMessageQuery из @shared/api/rtkApi
    // getMessage: (messageId: number, config?: RequestConfig) =>
    //     apiClient.get<MessageDTO>(API_ENDPOINTS.chat.getMessage(messageId), config),

    // Закомментировано: используйте useGetChatInfoQuery из @shared/api/rtkApi
    // getInfo: (chatId: number, config?: RequestConfig) =>
    //     apiClient.get<ChatDTO>(API_ENDPOINTS.chat.getInfo(chatId), config),

    // Закомментировано: используйте useGetChatMessagesQuery из @shared/api/rtkApi
    // getMessages: (
    //     chatId: number,
    //     args?: { cursor?: number | null; take?: number },
    //     config?: RequestConfig
    // ) =>
    //     apiClient.get<CursorPageDTO<MessageDTO>>(API_ENDPOINTS.chat.getMessages(chatId), {
    //         ...config,
    //         params: {
    //             ...(config?.params ?? {}),
    //             ...(args?.cursor ? { cursor: args.cursor } : {}),
    //             ...(args?.take ? { take: args.take } : {}),
    //         },
    //     }),

    /**
     * @deprecated Use useAddUserToChatMutation from @shared/api/rtkApi instead
     */
    addUser: (chatId: number, userId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.addUser(chatId, userId), undefined, config),

    /**
     * @deprecated Use useLeaveChatMutation from @shared/api/rtkApi instead
     */
    leave: (chatId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.chat.leave(chatId), config),

    /**
     * @deprecated Use useRemoveUserFromChatMutation from @shared/api/rtkApi instead
     */
    removeUser: (chatId: number, userId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.chat.removeUser(chatId, userId), config),

    /**
     * @deprecated Use useUpdateChatCoverMutation from @shared/api/rtkApi instead
     */
    updateCover: (chatId: number, file: File, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiClient.put<void>(API_ENDPOINTS.chat.updateCover(chatId), fd, {
            ...config,
            bodyType: 'form',
        });
    },

    /**
     * @deprecated Use useUpdateChatNameMutation from @shared/api/rtkApi instead
     */
    updateName: (chatId: number, newName: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.updateName(chatId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), newName },
        }),

    /**
     * @deprecated Use useReadMessagesMutation from @shared/api/rtkApi instead
     */
    readMessages: (chatId: number, messageIds: number[], config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.readMessages(chatId), messageIds, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useReadAllMessagesMutation from @shared/api/rtkApi instead
     */
    readAllMessages: (chatId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.readAllMessages(chatId), undefined, config),
};

