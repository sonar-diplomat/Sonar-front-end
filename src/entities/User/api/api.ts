import { apiClient } from '@shared/api/client'
import { API_ENDPOINTS } from '@shared/config'
import type { NonSensetiveUserDTO, User, UserUpdateDTO } from '@entities/User'

export const Api = {
    list: () => apiClient.get<User[]>(API_ENDPOINTS.user.list),
    byId: (id: number) => apiClient.get<NonSensetiveUserDTO>(API_ENDPOINTS.user.byId(id)),
    update: (data: UserUpdateDTO) => apiClient.put<User>(API_ENDPOINTS.user.update, data),
    updateAvatar: (file: File) => {
        const form = new FormData()
        form.append('file', file)
        return apiClient.post<void>(API_ENDPOINTS.user.updateAvatar, form, { bodyType: 'form' })
    },
}

