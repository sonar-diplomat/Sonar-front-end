import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { CreateChatDTO, MessageDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';

export const Api = {
    create: (dto: CreateChatDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.create, dto, {
            ...config,
            bodyType: 'json',
        }),

    sendMessage: (chatId: number, message: MessageDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.sendMessage(chatId), message, {
            ...config,
            bodyType: 'json',
        }),

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

    addUser: (chatId: number, userId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.chat.addUser(chatId, userId), undefined, config),

    leave: (chatId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.chat.leave(chatId), config),

    removeUser: (chatId: number, userId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.chat.removeUser(chatId, userId), config),

    updateCover: (chatId: number, file: File, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiClient.put<void>(API_ENDPOINTS.chat.updateCover(chatId), fd, {
            ...config,
            bodyType: 'form',
        });
    },

    updateName: (chatId: number, newName: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.updateName(chatId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), newName },
        }),

    readMessages: (chatId: number, messageIds: number[], config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.readMessages(chatId), messageIds, {
            ...config,
            bodyType: 'json',
        }),

    readAllMessages: (chatId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.chat.readAllMessages(chatId), undefined, config),
};

