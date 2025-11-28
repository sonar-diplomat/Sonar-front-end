import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';

import type { TrackDTO } from '@entities/Music';
import type { ShareLinkDTO } from '@entities/Collection';
import type {RequestConfig} from "@shared/types";
import type {CreatePlaylistDTO, CursorPageDTO, PlaylistDTO} from "@entities/Playlist";



export const Api = {
    /**
     * @deprecated Use useCreatePlaylistMutation from @shared/api/rtkApi instead
     */
    create: (body: CreatePlaylistDTO, config?: RequestConfig) =>
        apiClient.post<PlaylistDTO>(API_ENDPOINTS.playlist.create, body, { ...config, bodyType: 'json' }),
    /**
     * @deprecated Use useDeletePlaylistMutation from @shared/api/rtkApi instead
     */
    delete: (playlistId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.playlist.delete(playlistId), config),
    /**
     * @deprecated Use useUpdatePlaylistNameMutation from @shared/api/rtkApi instead
     */
    updateName: (playlistId: number, newName: string, config?: RequestConfig) =>
        apiClient.put<PlaylistDTO>(API_ENDPOINTS.playlist.updateName(playlistId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), newName },
        }),
    /**
     * @deprecated Use useUpdatePlaylistCoverMutation from @shared/api/rtkApi instead
     */
    updateCover: (playlistId: number, coverFile: File, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('coverFile', coverFile);
        return apiClient.put<void>(API_ENDPOINTS.playlist.updateCover(playlistId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    /**
     * @deprecated Use useAddContributorMutation from @shared/api/rtkApi instead
     */
    addContributor: (playlistId: number, contributorId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.playlist.addContributor(playlistId, contributorId), undefined, config),
    /**
     * @deprecated Use useRemoveContributorMutation from @shared/api/rtkApi instead
     */
    removeContributor: (playlistId: number, contributorId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.playlist.removeContributor(playlistId, contributorId), config),
    /**
     * @deprecated Use useAddTrackToPlaylistMutation from @shared/api/rtkApi instead
     */
    addTrack: (playlistId: number, trackId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.playlist.addTrack(playlistId, trackId), undefined, config),
    /**
     * @deprecated Use useRemoveTrackFromPlaylistMutation from @shared/api/rtkApi instead
     */
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
    /**
     * @deprecated Use useImportCollectionToPlaylistMutation from @shared/api/rtkApi instead
     */
    importCollection: (playlistId: number, collection: string, collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(
            API_ENDPOINTS.playlist.importCollection(playlistId, collection, collectionId),
            undefined,
            config
        ),
    // Закомментировано: используйте useGetPlaylistShareLinkQuery из @shared/api/rtkApi
    // shareLink: (playlistId: number, config?: RequestConfig) =>
    //     apiClient.get<ShareLinkDTO>(API_ENDPOINTS.playlist.shareLink(playlistId), config),
    // Note: shareQr returns Blob, keeping in legacy API
    shareQr: (playlistId: number, config?: RequestConfig) =>
        apiClient.download(API_ENDPOINTS.playlist.shareQr(playlistId), { ...config }),
    /**
     * @deprecated Use useUpdatePlaylistVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (playlistId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.playlist.updateVisibility(playlistId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
};
