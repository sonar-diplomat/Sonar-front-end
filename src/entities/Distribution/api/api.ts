import { apiClient } from '@shared/api/oldBaseApi.ts';
import { API_ENDPOINTS } from '@shared/config';
import type {
    DistributorDTO,
    CreateDistributorDTO,
    UpdateDistributorDTO,
    DistributorAccountDTO,
    DistributorAccountRegisterDTO,
    DistributorAccountChangePasswordDTO,
    ArtistRegistrationRequestDTO,
} from '../model/types';
import type { RequestConfig } from '@shared/types';
import type { LoginResponseDTO, RefreshTokenResponse, ActiveSessionDTO } from '@features/auth';

export const DistributorApi = {
    create: (dto: CreateDistributorDTO, config?: RequestConfig) => {
        const fd = new FormData();
        fd.append('Name', dto.name);
        fd.append('Description', dto.description);
        fd.append('ContactEmail', dto.contactEmail);
        fd.append('ExpirationDate', dto.expirationDate);
        fd.append('Cover', dto.cover);
        return apiClient.post<DistributorDTO>(API_ENDPOINTS.distributor.create, fd, {
            ...config,
            bodyType: 'form',
        });
    },

    // Закомментировано: используйте useGetDistributorsQuery из @shared/api/rtkApi
    // list: (config?: RequestConfig) =>
    //     apiClient.get<DistributorDTO[]>(API_ENDPOINTS.distributor.list, config),

    // Закомментировано: используйте useGetDistributorQuery из @shared/api/rtkApi
    // byId: (id: number, config?: RequestConfig) =>
    //     apiClient.get<DistributorDTO>(API_ENDPOINTS.distributor.byId(id), config),

    update: (id: number, dto: UpdateDistributorDTO, config?: RequestConfig) =>
        apiClient.put<DistributorDTO>(API_ENDPOINTS.distributor.update(id), dto, {
            ...config,
            bodyType: 'json',
        }),

    delete: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.distributor.delete(id), config),

    updateKey: (id: number, config?: RequestConfig) =>
        apiClient.get<string>(API_ENDPOINTS.distributor.updateKey(id), config),

    // Закомментировано: используйте useGetArtistRequestsQuery из @shared/api/rtkApi
    // getArtistRequest: (config?: RequestConfig) =>
    //     apiClient.get<ArtistRegistrationRequestDTO[]>(API_ENDPOINTS.distributor.request, config),

    // Закомментировано: используйте useGetArtistRequestQuery из @shared/api/rtkApi
    // getArtistRequestById: (requestId: number, config?: RequestConfig) =>
    //     apiClient.get<ArtistRegistrationRequestDTO>(API_ENDPOINTS.distributor.requestById(requestId), config),

    resolveArtistRequest: (requestId: number, approve: boolean, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.distributor.resolveRequest(requestId), undefined, {
            ...config,
            params: { ...(config?.params ?? {}), approve },
        }),
};

export const AuthDistributorApi = {
    terminateSession: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.authDistributor.terminateSession(id), config),

    register: (dto: DistributorAccountRegisterDTO, config?: RequestConfig) =>
        apiClient.post<DistributorAccountDTO>(API_ENDPOINTS.authDistributor.register, dto, {
            ...config,
            bodyType: 'json',
        }),

    login: (email: string, password: string, deviceName: string) =>
        apiClient.post<LoginResponseDTO>(
            `${API_ENDPOINTS.authDistributor.login}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            undefined,
            {
                headers: { 'X-Device-Name': deviceName },
            }
        ),

    refreshToken: (token: string) =>
        apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.authDistributor.refreshToken, token, {
            bodyType: 'raw',
        }),

    revokeSession: (sessionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.authDistributor.revokeSession(sessionId), undefined, config),

    revokeAllSessions: (config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.authDistributor.revokeAllSessions, undefined, config),

    getSessions: (config?: RequestConfig) =>
        apiClient.get<ActiveSessionDTO[]>(API_ENDPOINTS.authDistributor.getSessions, config),
};

export const DistributorMasterApi = {
    deleteAccount: (id: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.distributorMaster.deleteAccount(id), config),

    changeUsername: (id: number, newUserName: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.distributorMaster.changeUsername(id), newUserName, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    // Закомментировано: используйте useGetDistributorAccountQuery из @shared/api/rtkApi
    // getAccount: (id: number, config?: RequestConfig) =>
    //     apiClient.get<DistributorAccountDTO>(API_ENDPOINTS.distributorMaster.getAccount(id), config),

    changeEmail: (id: number, newEmail: string, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.distributorMaster.changeEmail(id), newEmail, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    changePassword: (id: number, dto: DistributorAccountChangePasswordDTO, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.distributorMaster.changePassword(id), dto, {
            ...config,
            bodyType: 'json',
        }),
};

