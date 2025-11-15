import { apiClient } from '@shared/api/client'
import { API_ENDPOINTS } from '@shared/config'
import type { NonSensetiveUserDTO, User, UserUpdateDTO } from '@entities/User'
import type { RequestConfig } from '@shared/types'

export const Api = {
    // Закомментировано: используйте useGetUsersQuery из @shared/api/rtkApi
    // list: (config?: RequestConfig) => apiClient.get<User[]>(API_ENDPOINTS.user.list, config),
    // Закомментировано: используйте useGetUserByIdQuery из @shared/api/rtkApi
    // byId: (id: number, config?: RequestConfig) => apiClient.get<NonSensetiveUserDTO>(API_ENDPOINTS.user.byId(id), config),
    update: (data: UserUpdateDTO, config?: RequestConfig) => apiClient.put<User>(API_ENDPOINTS.user.update, data, {
        ...config,
        bodyType: 'json',
    }),
    updateAvatar: (file: File, config?: RequestConfig) => {
        const form = new FormData()
        form.append('file', file)
        return apiClient.post<void>(API_ENDPOINTS.user.updateAvatar, form, {
            ...config,
            bodyType: 'form',
        })
    },
    updateVisibility: (collectionId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.user.updateVisibility(collectionId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
}

