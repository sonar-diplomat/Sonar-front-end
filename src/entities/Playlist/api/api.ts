import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';

import type { TrackDTO } from '@entities/Music';
import type { ShareLinkDTO } from '@entities/Collection';
import type {RequestConfig} from "@shared/types";
import type {CreatePlaylistDTO, CursorPageDTO, PlaylistDTO} from "@entities/Playlist";



export const Api = {
    create: (body: CreatePlaylistDTO, config?: RequestConfig) =>
        apiClient.post<PlaylistDTO>(API_ENDPOINTS.playlist.create, body, { ...config, bodyType: 'json' }),
    delete: (playlistId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.playlist.delete(playlistId), config),
    updateName: (playlistId: number, newName: string, config?: RequestConfig) =>
        apiClient.put<PlaylistDTO>(API_ENDPOINTS.playlist.updateName(playlistId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), newName },
        }),
    updateCover: (playlistId: number, coverFile: File, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('coverFile', coverFile);
        return apiClient.put<void>(API_ENDPOINTS.playlist.updateCover(playlistId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    addContributor: (playlistId: number, contributorId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.playlist.addContributor(playlistId, contributorId), undefined, config),
    removeContributor: (playlistId: number, contributorId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.playlist.removeContributor(playlistId, contributorId), config),
    addTrack: (playlistId: number, trackId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.playlist.addTrack(playlistId, trackId), undefined, config),
    removeTrack: (playlistId: number, trackId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.playlist.removeTrack(playlistId, trackId), config),
    tracks: (playlistId: number, args?: { after?: string | null; limit?: number }, config?: RequestConfig) =>
        apiClient.get<CursorPageDTO<TrackDTO>>(API_ENDPOINTS.playlist.tracks(playlistId), {
            ...config,
            params: { ...(config?.params ?? {}), ...(args?.after ? { after: args.after } : {}), ...(args?.limit ? { limit: args.limit } : {}) },
        }),
    // Закомментировано: используйте useGetPlaylistQuery из @shared/api/rtkApi
    // byId: (playlistId: number, config?: RequestConfig) =>
    //     apiClient.get<PlaylistDTO>(API_ENDPOINTS.playlist.byId(playlistId), config),
    importCollection: (playlistId: number, collection: string, collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(
            API_ENDPOINTS.playlist.importCollection(playlistId, collection, collectionId),
            undefined,
            config
        ),
    // Закомментировано: используйте useGetPlaylistShareLinkQuery из @shared/api/rtkApi
    // shareLink: (playlistId: number, config?: RequestConfig) =>
    //     apiClient.get<ShareLinkDTO>(API_ENDPOINTS.playlist.shareLink(playlistId), config),
    shareQr: (playlistId: number, config?: RequestConfig) =>
        apiClient.download(API_ENDPOINTS.playlist.shareQr(playlistId), { ...config }),
    updateVisibility: (playlistId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.playlist.updateVisibility(playlistId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};
