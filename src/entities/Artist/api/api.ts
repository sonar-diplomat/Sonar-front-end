import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { PostDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';

export const Api = {
    register: (config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.artist.register, undefined, config),

    updateName: (artistId: number, newArtistName: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updateName(artistId), newArtistName, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    delete: (config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.artist.delete, config),

    createPost: (dto: PostDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.artist.createPost, dto, {
            ...config,
            bodyType: 'json',
        }),

    deletePost: (postId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.artist.deletePost(postId), config),

    updatePost: (postId: number, dto: PostDTO, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updatePost(postId), dto, {
            ...config,
            bodyType: 'json',
        }),

    updatePostVisibility: (postId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updatePostVisibility(postId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};

