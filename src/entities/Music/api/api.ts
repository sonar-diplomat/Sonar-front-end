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
    updateInfo: (trackId: number, body: UpdateTrackDTO, config?: RequestConfig) =>
        apiClient.put<TrackDTO>(API_ENDPOINTS.track.update(trackId), body, {
            ...config,
            bodyType: 'json',
        }),
    updateFile: (trackId: number, body: UpdateTrackFileDTO, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('PlaybackQualityId', String(body.playbackQualityId));
        fd.append('File', body.file);
        return apiClient.put<void>(API_ENDPOINTS.track.updateFile(trackId), fd, {
            ...config,
            bodyType: 'form',
        });
    },
    delete: (trackId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.track.delete(trackId), config),
    stream: async (
        trackId: number,
        opts?: { download?: boolean },
        config?: Omit<RequestConfig, 'bodyType'>
    ) => {
        // Для download нужно проверить авторизацию вручную, так как это не NormalizedApiResponse
        const accessToken = authManager.getAccessToken();
        const refreshToken = authManager.getRefreshToken();

        // Если нет токенов вообще, пытаемся автоматически залогиниться
        if (!accessToken && !refreshToken) {
            const loginSuccess = await authManager.autoLogin();
            if (!loginSuccess) {
                throw new Error('Authentication required');
            }
        }

        // Если есть access token, проверяем его валидность
        if (accessToken) {
            // Если токен истекает или истек, пытаемся обновить его через refresh token
            if (shouldRefreshToken(accessToken) && refreshToken) {
                const newToken = await authManager.refreshAccessToken();
                
                // Если refresh не удался, пытаемся автологин
                if (!newToken) {
                    const loginSuccess = await authManager.autoLogin();
                    if (!loginSuccess) {
                        throw new Error('Session expired. Please login again');
                    }
                }
            }
        } else if (refreshToken) {
            // Если нет access token, но есть refresh token, пытаемся обновить
            const newToken = await authManager.refreshAccessToken();
            
            if (!newToken) {
                // Если refresh не удался, пытаемся автологин
                const loginSuccess = await authManager.autoLogin();
                if (!loginSuccess) {
                    throw new Error('Session expired. Please login again');
                }
            }
        }

        return apiClient.download(API_ENDPOINTS.track.stream(trackId), {
            ...config,
            params: { ...(config?.params ?? {}), download: Boolean(opts?.download) },
            withAuth: config?.withAuth ?? true,
        });
    },
    updateVisibility: (trackId: number, visibilityStatusId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.track.updateVisibility(trackId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), visibilityStatusId },
        }),
    toggleFavorite: (trackId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.track.toggleFavorite(trackId), undefined, config),
};
