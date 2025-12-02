import { apiClient } from '@shared/api/oldBaseApi.ts'
import { API_ENDPOINTS } from '@shared/config'
import type { User, UserUpdateDTO } from '@entities/User'
import type { RequestConfig } from '@shared/types'

export const Api = {
    // Закомментировано: используйте useGetUsersQuery из @shared/api/rtkApi
    // list: (config?: RequestConfig) => apiClient.get<User[]>(API_ENDPOINTS.user.list, config),
    // Закомментировано: используйте useGetUserByIdQuery из @shared/api/rtkApi
    // byId: (id: number, config?: RequestConfig) => apiClient.get<NonSensitiveUserDTO>(API_ENDPOINTS.user.byId(id), config),
    update: (data: UserUpdateDTO, config?: RequestConfig) => apiClient.put<User>(API_ENDPOINTS.user.update, data, {
        ...config,
        bodyType: 'json',
    }),
    /**
     * @deprecated Use useUpdateUserAvatarMutation from @shared/api/rtkApi instead
     */
    updateAvatar: (file: File, config?: RequestConfig) => {
        const form = new FormData()
        form.append('file', file)
        return apiClient.post<void>(API_ENDPOINTS.user.updateAvatar, form, {
            ...config,
            bodyType: 'form',
        })
    },
    /**
     * @deprecated Use useUpdateUserVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.user.updateVisibility(collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
    /**
     * @deprecated Use useSendFriendRequestMutation from @shared/api instead
     */
    sendFriendRequest: (toUserId: number, config?: RequestConfig) =>
        apiClient.post(API_ENDPOINTS.user.sendFriendRequest(toUserId), undefined, config),
    /**
     * @deprecated Use useGetPendingFriendRequestsQuery from @shared/api instead
     */
    getPendingFriendRequests: (config?: RequestConfig) =>
        apiClient.get(API_ENDPOINTS.user.getPendingFriendRequests, config),
    /**
     * @deprecated Use useGetSentFriendRequestsQuery from @shared/api instead
     */
    getSentFriendRequests: (config?: RequestConfig) =>
        apiClient.get(API_ENDPOINTS.user.getSentFriendRequests, config),
    /**
     * @deprecated Use useResolveFriendRequestMutation from @shared/api instead
     */
    resolveFriendRequest: (requestId: number, accept: boolean, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.user.resolveFriendRequest(requestId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), accept },
        }),
    /**
     * @deprecated Use useRemoveFriendMutation from @shared/api instead
     */
    removeFriend: (friendId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.user.removeFriend(friendId), config),
    /**
     * @deprecated Use useGetFriendsQuery from @shared/api instead
     */
    getFriends: (config?: RequestConfig) =>
        apiClient.get(API_ENDPOINTS.user.getFriends, config),
}

