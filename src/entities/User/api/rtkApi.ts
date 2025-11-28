import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type { User, NonSensetiveUserDTO, UserUpdateDTO } from '../model/types';

/**
 * User API endpoints
 */
export const userApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<NonSensetiveUserDTO, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.user.byId(userId),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),

    updateUser: builder.mutation<User, UserUpdateDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.user.update,
        method: 'PUT',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUserAvatar: builder.mutation<void, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: API_ENDPOINTS.user.updateAvatar,
          method: 'POST',
          body: form,
          bodyType: 'form',
          withAuth: true,
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUserVisibility: builder.mutation<void, { collectionId: number; visibilityStatusId: number }>({
      query: ({ collectionId, visibilityStatusId }) => ({
        url: API_ENDPOINTS.user.updateVisibility(collectionId),
        method: 'PUT',
        params: { visibilityStatusId },
        withAuth: true,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserAvatarMutation,
  useUpdateUserVisibilityMutation,
} = userApi;

