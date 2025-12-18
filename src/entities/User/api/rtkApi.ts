import { rtkApi } from '@shared/api/rtkApi';
import { API_ENDPOINTS } from '@shared/config';
import type {
  User,
  NonSensitiveUserDTO,
  UserProfileDTO,
  UserUpdateDTO,
  UserFriendDTO,
  UserFollowerDTO,
  UserFollowingDTO,
  TopTrackDTO,
  TopArtistDTO,
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

    getUserProfile: builder.query<UserProfileDTO, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.user.profile(userId),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: `PROFILE_${userId}` }],
    }),

    getUserProfileByIdentifier: builder.query<UserProfileDTO, string>({
      query: (identifier) => ({
        url: API_ENDPOINTS.user.profileByIdentifier(identifier),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, identifier) => [{ type: 'User', id: `PROFILE_${identifier}` }],
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

    getTopTracks: builder.query<TopTrackDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.topTracks,
        method: 'GET',
        withAuth: true,
      }),
    }),

    getTopArtists: builder.query<TopArtistDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.topArtists,
        method: 'GET',
        withAuth: true,
      }),
    }),

    // Profile statistics endpoints
    getFollowers: builder.query<{ items: UserFollowerDTO[]; count: number }, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.userFollow.followers(userId),
        method: 'GET',
        withAuth: true,
      }),
      transformResponse: (response: UserFollowerDTO[]) => ({
        items: response,
        count: response.length,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: `FOLLOWERS_${userId}` }],
    }),

    getFollowing: builder.query<{ items: UserFollowingDTO[]; count: number }, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.userFollow.following(userId),
        method: 'GET',
        withAuth: true,
      }),
      transformResponse: (response: UserFollowingDTO[]) => ({
        items: response,
        count: response.length,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: `FOLLOWING_${userId}` }],
    }),

    // Follow/Unfollow endpoints
    followUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.userFollow.follow(userId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: `FOLLOWERS_${userId}` },
        { type: 'User', id: `FOLLOWING_${userId}` },
        { type: 'User', id: `PROFILE_${userId}` },
        { type: 'User', id: 'LIST' },
        { type: 'Friend', id: 'LIST' },
      ],
    }),

    unfollowUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: API_ENDPOINTS.userFollow.unfollow(userId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: `FOLLOWERS_${userId}` },
        { type: 'User', id: `FOLLOWING_${userId}` },
        { type: 'User', id: `PROFILE_${userId}` },
        { type: 'User', id: 'LIST' },
        { type: 'Friend', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserProfileQuery,
  useGetUserProfileByIdentifierQuery,
  useUpdateUserMutation,
  useUpdateUserAvatarMutation,
  useUpdateUserVisibilityMutation,
  useRemoveFriendMutation,
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetTopTracksQuery,
  useGetTopArtistsQuery,
} = userApi;
