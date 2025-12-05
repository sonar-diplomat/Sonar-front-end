import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  User,
  NonSensitiveUserDTO,
  UserUpdateDTO,
  UserFriendRequestDTO,
  UserReceivedFriendRequestDTO,
  UserSentFriendRequestDTO,
  UserFriendDTO,
} from '../model/types';

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

    getUserById: builder.query<NonSensitiveUserDTO, number>({
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

    // Friend Request endpoints
    sendFriendRequest: builder.mutation<UserFriendRequestDTO, number>({
      query: (toUserId) => ({
        url: API_ENDPOINTS.user.sendFriendRequest(toUserId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'FriendRequest', id: 'SENT_LIST' },
        { type: 'FriendRequest', id: 'PENDING_LIST' },
      ],
    }),

    getPendingFriendRequests: builder.query<UserReceivedFriendRequestDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.getPendingFriendRequests,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'FriendRequest', id: 'PENDING_LIST' }],
    }),

    getSentFriendRequests: builder.query<UserSentFriendRequestDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.getSentFriendRequests,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'FriendRequest', id: 'SENT_LIST' }],
    }),

    resolveFriendRequest: builder.mutation<void, { requestId: number; accept: boolean }>({
      query: ({ requestId, accept }) => ({
        url: API_ENDPOINTS.user.resolveFriendRequest(requestId),
        method: 'PUT',
        params: { accept },
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'FriendRequest', id: 'PENDING_LIST' },
        { type: 'Friend', id: 'LIST' },
      ],
    }),

    removeFriend: builder.mutation<void, number>({
      query: (friendId) => ({
        url: API_ENDPOINTS.user.removeFriend(friendId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Friend', id: 'LIST' }],
    }),

    getFriends: builder.query<UserFriendDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.getFriends,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Friend', id: 'LIST' }],
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
  useSendFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useResolveFriendRequestMutation,
  useRemoveFriendMutation,
  useGetFriendsQuery,
} = userApi;

