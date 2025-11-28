import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { AlbumDTO, UploadAlbumDTO } from '../model/types.ts';
import type { ShareLinkDTO } from '@entities/Collection';
import type {RequestConfig} from "@shared/types";

export const AlbumApi = {
    /**
     * @deprecated Use useUploadAlbumMutation from @shared/api/rtkApi instead
     */
    upload: (body: UploadAlbumDTO, config?: RequestConfig) =>
        apiClient.post<AlbumDTO>(API_ENDPOINTS.album.upload, body as unknown as BodyInit, {
            ...config,
            bodyType: config?.bodyType ?? 'form',
        }),
    /**
     * @deprecated Use useDeleteAlbumMutation from @shared/api/rtkApi instead
     */
    delete: (albumId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.album.delete(albumId), config),
    /**
     * @deprecated Use useUpdateAlbumNameMutation from @shared/api/rtkApi instead
     */
    updateName: (albumId: number, name: string, config?: RequestConfig) =>
        apiClient.put<AlbumDTO>(API_ENDPOINTS.album.updateName(albumId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), name },
        }),
    /**
     * @deprecated Use useAddTrackToAlbumMutation from @shared/api/rtkApi instead
     */
    addTrack: (albumId: number, body: unknown, config?: RequestConfig) =>
        apiClient.post(API_ENDPOINTS.album.addTrack(albumId), body as BodyInit, {
            ...config,
            bodyType: config?.bodyType ?? 'form',
        }),
    /**
     * @deprecated Use useUpdateAlbumCoverMutation from @shared/api/rtkApi instead
     */
    updateCover: (albumId: number, file: File, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiClient.put<void>(API_ENDPOINTS.album.updateCover(albumId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    // Закомментировано: используйте useGetAlbumShareLinkQuery из @shared/api/rtkApi
    // shareLink: (albumId: number, config?: RequestConfig) =>
    //     apiClient.get<ShareLinkDTO>(API_ENDPOINTS.album.shareLink(albumId), config),
    // Note: shareQr returns Blob, keeping in legacy API
    shareQr: (albumId: number, config?: RequestConfig) =>
        apiClient.download(API_ENDPOINTS.album.shareQr(albumId), { ...config }),
    /**
     * @deprecated Use useUpdateAlbumVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (albumId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.album.updateVisibility(albumId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};
