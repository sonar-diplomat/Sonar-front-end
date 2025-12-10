import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type { TrackDTO, UpdateTrackDTO, UpdateTrackFileDTO } from '../model/types.ts';
import type {RequestConfig} from "@shared/types";
import { authManager } from '@shared/lib/auth/auth-manager';
import { shouldRefreshToken } from '@shared/lib/auth/jwt-utils';


export const Api = {
    // Закомментировано: используйте useGetTrackQuery из @shared/api/rtkApi
    // getById: (trackId: number, config?: RequestConfig) =>
    //     apiClient.get<TrackDTO>(API_ENDPOINTS.track.byId(trackId), config),
    /**
     * @deprecated Use useUpdateTrackMutation from @shared/api/rtkApi instead
     */
    updateInfo: (trackId: number, body: UpdateTrackDTO, config?: RequestConfig) =>
        apiClient.put<TrackDTO>(API_ENDPOINTS.track.update(trackId), body, {
            ...config,
            bodyType: 'json',
        }),
    /**
     * @deprecated Use useUpdateTrackFileMutation from @shared/api/rtkApi instead
     */
    updateFile: (trackId: number, body: UpdateTrackFileDTO, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('PlaybackQualityId', String(body.playbackQualityId));
        fd.append('File', body.file);
        return apiClient.put<void>(API_ENDPOINTS.track.updateFile(trackId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    /**
     * @deprecated Use useDeleteTrackMutation from @shared/api/rtkApi instead
     */
    delete: (trackId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.track.delete(trackId), config),
    stream: async (
        trackId: number,
        opts?: {
            startPosition?: string;
            length?: string;
            download?: boolean;
        },
        config?: Omit<RequestConfig, 'bodyType'>
    ) => {
        // Для download нужно проверить авторизацию вручную, так как это не NormalizedApiResponse
        const accessToken = authManager.getAccessToken();
        const refreshToken = authManager.getRefreshToken();

        // Если нет токенов вообще, требуется логин
        if (!accessToken && !refreshToken) {
            throw new Error('Authentication required');
        }

        // Если есть access token, проверяем его валидность
        if (accessToken) {
            // Если токен истекает или истек, пытаемся обновить его через refresh token
            if (shouldRefreshToken(accessToken) && refreshToken) {
                const newToken = await authManager.refreshAccessToken();
                
                // Если refresh не удался, требуется новый логин
                if (!newToken) {
                    throw new Error('Session expired. Please login again');
                }
            }
        } else if (refreshToken) {
            // Если нет access token, но есть refresh token, пытаемся обновить
            const newToken = await authManager.refreshAccessToken();
            
            if (!newToken) {
                // Если refresh не удался, требуется новый логин
                throw new Error('Session expired. Please login again');
            }
        }

        const queryParams: Record<string, any> = { ...(config?.params ?? {}) };
        if (opts?.startPosition) queryParams.startPosition = opts.startPosition;
        if (opts?.length) queryParams.length = opts.length;
        if (opts?.download) queryParams.download = opts.download;

        return apiClient.download(API_ENDPOINTS.track.stream(trackId), {
            ...config,
            params: queryParams,
            withAuth: config?.withAuth ?? true,
        });
    },
    /**
     * @deprecated Use useUpdateTrackVisibilityMutation from @shared/api/rtkApi instead
     */
    updateVisibility: (trackId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.track.updateVisibility(trackId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
    /**
     * @deprecated Use useToggleTrackFavoriteMutation from @shared/api/rtkApi instead
     */
    toggleFavorite: (trackId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.track.toggleFavorite(trackId), undefined, config),
};
