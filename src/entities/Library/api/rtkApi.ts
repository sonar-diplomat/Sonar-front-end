import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { FolderDTO, CreateFolderDTO } from '../model/types';
import { store } from '@shared/store';
import { markDirty } from '@shared/store/features/library/librarySlice';

/**
 * Library (Folder) API endpoints
 */
export const libraryApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getFolder: builder.query<FolderDTO, number>({
      query: (folderId) => ({
        url: API_ENDPOINTS.folder.byId(folderId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, folderId) => [{ type: 'Folder', id: folderId }],
    }),

    getFolders: builder.query<FolderDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.folder.list,
        method: 'GET',
        withAuth: true,
      }),
      transformResponse: (response: FolderDTO[] | any) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response) {
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      },
      providesTags: [{ type: 'Folder', id: 'LIST' }],
    }),

    createFolder: builder.mutation<FolderDTO, CreateFolderDTO>({
      query: (dto) => ({
        url: API_ENDPOINTS.folder.create,
        method: 'POST',
        body: dto,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Folder', id: 'LIST' }],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    updateFolderName: builder.mutation<FolderDTO, { folderId: number; newName: string }>({
      query: ({ folderId, newName }) => ({
        url: API_ENDPOINTS.folder.updateName(folderId),
        method: 'PUT',
        body: newName,
        bodyType: 'raw',
        headers: { 'content-type': 'text/plain' },
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { folderId }) => [
        { type: 'Folder', id: folderId },
        { type: 'Folder', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    deleteFolder: builder.mutation<void, number>({
      query: (folderId) => ({
        url: API_ENDPOINTS.folder.delete(folderId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, folderId) => [
        { type: 'Folder', id: folderId },
        { type: 'Folder', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    addCollectionToFolder: builder.mutation<void, { folderId: number; collectionId: number }>({
      query: ({ folderId, collectionId }) => ({
        url: API_ENDPOINTS.folder.addCollection(folderId, collectionId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { folderId }) => [{ type: 'Folder', id: folderId }],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    removeCollectionFromFolder: builder.mutation<void, { folderId: number; collectionId: number }>({
      query: ({ folderId, collectionId }) => ({
        url: API_ENDPOINTS.folder.removeCollection(folderId, collectionId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { folderId }) => [{ type: 'Folder', id: folderId }],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    moveCollectionToFolder: builder.mutation<void, { collectionId: number; targetFolderId: number }>({
      query: ({ collectionId, targetFolderId }) => ({
        url: API_ENDPOINTS.folder.moveCollection(collectionId, targetFolderId),
        method: 'PUT',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { targetFolderId }) => [
        { type: 'Folder', id: targetFolderId },
        { type: 'Folder', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),

    moveFolder: builder.mutation<void, { folderId: number; newParentFolderId: number }>({
      query: ({ folderId, newParentFolderId }) => ({
        url: API_ENDPOINTS.folder.move(folderId, newParentFolderId),
        method: 'PUT',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { folderId, newParentFolderId }) => [
        { type: 'Folder', id: folderId },
        { type: 'Folder', id: newParentFolderId },
        { type: 'Folder', id: 'LIST' },
      ],
      async onQueryStarted(_arg, { dispatch }) {
        store.dispatch(markDirty());
      },
    }),
  }),
});

// Export hooks
export const {
  useGetFolderQuery,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderNameMutation,
  useDeleteFolderMutation,
  useAddCollectionToFolderMutation,
  useRemoveCollectionFromFolderMutation,
  useMoveCollectionToFolderMutation,
  useMoveFolderMutation,
} = libraryApi;

