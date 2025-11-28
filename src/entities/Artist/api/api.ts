import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { PostDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';

export const Api = {
    /**
     * @deprecated Use useRegisterArtistMutation from @shared/api/rtkApi instead
     */
    register: (config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.artist.register, undefined, config),

    /**
     * @deprecated Use useUpdateArtistNameMutation from @shared/api/rtkApi instead
     */
    updateName: (artistId: number, newArtistName: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updateName(artistId), newArtistName, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    /**
     * @deprecated Use useDeleteArtistMutation from @shared/api/rtkApi instead
     */
    delete: (config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.artist.delete, config),

    /**
     * @deprecated Use useCreatePostMutation from @shared/api/rtkApi instead
     */
    createPost: (dto: PostDTO, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.artist.createPost, dto, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useDeletePostMutation from @shared/api/rtkApi instead
     */
    deletePost: (postId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.artist.deletePost(postId), config),

    /**
     * @deprecated Use useUpdatePostMutation from @shared/api/rtkApi instead
     */
    updatePost: (postId: number, dto: PostDTO, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updatePost(postId), dto, {
            ...config,
            bodyType: 'json',
        }),

    /**
     * @deprecated Use useUpdatePostVisibilityMutation from @shared/api/rtkApi instead
     */
    updatePostVisibility: (postId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.artist.updatePostVisibility(postId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};

