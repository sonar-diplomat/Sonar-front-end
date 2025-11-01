import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { TrackDTO, UpdateTrackDTO, UpdateTrackFileDTO } from '../model/types.ts';
import type {RequestConfig} from "@shared/types";


export const Api = {
    getById: (trackId: number, config?: RequestConfig) =>
        apiClient.get<TrackDTO>(API_ENDPOINTS.track.byId(trackId), config),
    updateInfo: (trackId: number, body: UpdateTrackDTO, config?: RequestConfig) =>
        apiClient.put<TrackDTO>(API_ENDPOINTS.track.update(trackId), body, {
            ...config,
            bodyType: 'json',
        }),
    updateFile: (trackId: number, body: UpdateTrackFileDTO, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('playbackQualityId', String(body.playbackQualityId));
        fd.append('file', body.file);
        return apiClient.put<void>(API_ENDPOINTS.track.updateFile(trackId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    delete: (trackId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.track.delete(trackId), config),
    stream: (
        trackId: number,
        opts?: { download?: boolean },
        config?: Omit<RequestConfig, 'bodyType'>
    ) =>
        apiClient.download(API_ENDPOINTS.track.stream(trackId), {
            ...config,
            params: { ...(config?.params ?? {}), download: Boolean(opts?.download) },
            withAuth: config?.withAuth ?? true,
        }),
};
