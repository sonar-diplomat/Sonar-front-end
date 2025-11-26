import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { AlbumDTO, UploadAlbumDTO } from '../model/types.ts';
import type { ShareLinkDTO } from '@entities/Collection';
import type {RequestConfig} from "@shared/types";

export const AlbumApi = {
    upload: (body: UploadAlbumDTO, config?: RequestConfig) =>
        apiClient.post<AlbumDTO>(API_ENDPOINTS.album.upload, body as unknown as BodyInit, {
            ...config,
            bodyType: config?.bodyType ?? 'form',
        }),
    delete: (albumId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.album.delete(albumId), config),
    updateName: (albumId: number, name: string, config?: RequestConfig) =>
        apiClient.put<AlbumDTO>(API_ENDPOINTS.album.updateName(albumId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), name },
        }),
    addTrack: (albumId: number, body: unknown, config?: RequestConfig) =>
        apiClient.post(API_ENDPOINTS.album.addTrack(albumId), body as BodyInit, {
            ...config,
            bodyType: config?.bodyType ?? 'form',
        }),
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
    shareQr: (albumId: number, config?: RequestConfig) =>
        apiClient.download(API_ENDPOINTS.album.shareQr(albumId), { ...config }),
    updateVisibility: (albumId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.album.updateVisibility(albumId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};
