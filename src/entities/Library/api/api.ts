import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@shared/config';
import type { FolderDTO, CreateFolderDTO } from '../model/types';
import type { RequestConfig } from '@shared/types';

export const Api = {
    // Закомментировано: используйте useGetFolderQuery из @shared/api/rtkApi
    // byId: (folderId: number, config?: RequestConfig) =>
    //     apiClient.get<FolderDTO>(API_ENDPOINTS.folder.byId(folderId), config),

    // Закомментировано: используйте useGetFoldersQuery из @shared/api/rtkApi
    // list: (config?: RequestConfig) =>
    //     apiClient.get<FolderDTO[]>(API_ENDPOINTS.folder.list, config),

    create: (dto: CreateFolderDTO, config?: RequestConfig) =>
        apiClient.post<FolderDTO>(API_ENDPOINTS.folder.create, dto, {
            ...config,
            bodyType: 'json',
        }),

    updateName: (folderId: number, newName: string, config?: RequestConfig) =>
        apiClient.put<FolderDTO>(API_ENDPOINTS.folder.updateName(folderId), newName, {
            ...config,
            bodyType: 'raw',
            headers: { ...(config?.headers ?? {}), 'content-type': 'text/plain' },
        }),

    delete: (folderId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.folder.delete(folderId), config),

    addCollection: (folderId: number, collectionId: number, config?: RequestConfig) =>
        apiClient.post<void>(API_ENDPOINTS.folder.addCollection(folderId, collectionId), undefined, config),

    removeCollection: (folderId: number, collectionId: number, config?: RequestConfig) =>
        apiClient.delete<void>(API_ENDPOINTS.folder.removeCollection(folderId, collectionId), config),

    move: (folderId: number, newParentFolderId: number, config?: RequestConfig) =>
        apiClient.put<void>(API_ENDPOINTS.folder.move(folderId, newParentFolderId), undefined, config),
};

