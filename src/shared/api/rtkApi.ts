import { createApi } from '@reduxjs/toolkit/query/react';
import { rtkBaseQuery } from './rtkBaseQuery';
import { API_ENDPOINTS } from '@shared/config';

// Import types
import type { TrackDTO } from '@entities/Music';
import type { User, NonSensitiveUserDTO } from '@entities/User';
import type { ChatDTO, MessageDTO } from '@entities/Chat';
import type { CursorPageDTO } from '@entities/Playlist';
import type { AccessFeatureDTO } from '@entities/Access';
import type { Settings } from '@entities/ClientSettings';
import type { FolderDTO } from '@entities/Library';
import type { GiftResponseDTO, GiftStyleDTO } from '@entities/Gift';
import type {
  ReportDTO,
  ReportFilterDTO,
  ReportReasonTypeDTO,
  ReportableEntityTypeDTO,
} from '@entities/Report';
import type {
  SubscriptionPackDTO,
  SubscriptionPaymentDTO,
  SubscriptionFeatureDTO,
} from '@entities/Subscription';
import type { PlaylistDTO } from '@entities/Playlist';
import type {
  DistributorDTO,
  DistributorAccountDTO,
  ArtistRegistrationRequestDTO,
} from '@entities/Distribution';
import type { ShareLinkDTO } from '@entities/Collection';
import type {
  ActiveSessionDTO,
  UserRegisterDTO,
  LoginResponseDTO,
  Verify2FaDTO,
  Verify2FaResponseDTO,
  RefreshTokenResponse,
  ConfirmEmailChangeDTO,
  ConfirmPasswordChangeDTO,
} from '@features/auth';

/**
 * Централизованный RTK Query API для всех GET запросов
 */
export const rtkApi = createApi({
  reducerPath: 'rtkApi',
  baseQuery: rtkBaseQuery,
  tagTypes: [
    'Track',
    'User',
    'Chat',
    'Message',
    'AccessFeature',
    'ClientSettings',
    'Folder',
    'Gift',
    'GiftStyle',
    'Report',
    'ReportReasonType',
    'ReportableEntityType',
    'SubscriptionPack',
    'SubscriptionPayment',
    'SubscriptionFeature',
    'Playlist',
    'Album',
    'Distributor',
    'DistributorAccount',
    'ArtistRegistrationRequest',
    'Share',
    'Session',
  ],
  endpoints: (builder) => ({
    // ==================== Music (Track) ====================
    getTrack: builder.query<TrackDTO, number>({
      query: (trackId) => ({
        url: API_ENDPOINTS.track.byId(trackId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, trackId) => [{ type: 'Track', id: trackId }],
    }),

    // ==================== User ====================
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

    // ==================== Chat ====================
    getMessage: builder.query<MessageDTO, number>({
      query: (messageId) => ({
        url: API_ENDPOINTS.chat.getMessage(messageId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, messageId) => [{ type: 'Message', id: messageId }],
    }),

    getChatInfo: builder.query<ChatDTO, number>({
      query: (chatId) => ({
        url: API_ENDPOINTS.chat.getInfo(chatId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, chatId) => [{ type: 'Chat', id: chatId }],
    }),

    getChatMessages: builder.query<
      CursorPageDTO<MessageDTO>,
      { chatId: number; cursor?: number | null; take?: number }
    >({
      query: ({ chatId, cursor, take }) => ({
        url: API_ENDPOINTS.chat.getMessages(chatId),
        method: 'GET',
        withAuth: true,
        params: {
          ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
          ...(take !== undefined ? { take } : {}),
        },
      }),
      providesTags: (_result, _error, { chatId }) => [{ type: 'Message', id: `chat-${chatId}` }],
    }),

    // ==================== Access ====================
    getAccessFeatures: builder.query<AccessFeatureDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.accessFeature.list,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'AccessFeature', id: 'LIST' }],
    }),

    getAccessFeatureById: builder.query<AccessFeatureDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.accessFeature.byId(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'AccessFeature', id }],
    }),

    getUserAccessFeatures: builder.query<AccessFeatureDTO[], number>({
      query: (userId) => ({
        url: API_ENDPOINTS.accessFeature.byUserId(userId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'AccessFeature', id: `user-${userId}` }],
    }),

    // ==================== ClientSettings ====================
    getClientSettings: builder.query<Settings, void>({
      query: () => ({
        url: API_ENDPOINTS.clientSettings.get,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ClientSettings', id: 'CURRENT' }],
    }),

    // ==================== Library (Folder) ====================
    getFolder: builder.query<FolderDTO, number>({
      query: (folderId) => ({
        url: API_ENDPOINTS.folder.byId(folderId),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, folderId) => [{ type: 'Folder', id: folderId }],
    }),

    getFolders: builder.query<FolderDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.folder.list,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'Folder', id: 'LIST' }],
    }),

    // ==================== Gift ====================
    getReceivedGifts: builder.query<GiftResponseDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.gift.received,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Gift', id: 'RECEIVED' }],
    }),

    getSentGifts: builder.query<GiftResponseDTO[], { senderId?: number }>({
      query: ({ senderId }) => ({
        url: API_ENDPOINTS.gift.sent,
        method: 'GET',
        withAuth: true,
        params: senderId ? { senderId } : undefined,
      }),
      providesTags: [{ type: 'Gift', id: 'SENT' }],
    }),

    getGift: builder.query<GiftResponseDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Gift', id }],
    }),

    getGiftStyles: builder.query<GiftStyleDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.gift.styles,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'GiftStyle', id: 'LIST' }],
    }),

    getGiftStyleById: builder.query<GiftStyleDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.gift.styleById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'GiftStyle', id }],
    }),

    // ==================== Report ====================
    getReports: builder.query<ReportDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Report', id: 'LIST' }],
    }),

    getReport: builder.query<ReportDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Report', id }],
    }),

    getReportsFilter: builder.query<ReportDTO[], { filter: ReportFilterDTO }>({
      query: ({ filter }) => ({
        url: API_ENDPOINTS.report.filter,
        method: 'GET',
        withAuth: true,
        params: {
          filter: JSON.stringify(filter),
        },
      }),
      providesTags: [{ type: 'Report', id: 'FILTERED' }],
    }),

    getReportsByReporter: builder.query<ReportDTO[], number>({
      query: (reporterId) => ({
        url: API_ENDPOINTS.report.byReporter(reporterId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, reporterId) => [{ type: 'Report', id: `reporter-${reporterId}` }],
    }),

    getOpenReports: builder.query<ReportDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.open,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Report', id: 'OPEN' }],
    }),

    getReportReasonTypes: builder.query<ReportReasonTypeDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.reasonTypes,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ReportReasonType', id: 'LIST' }],
    }),

    getReportReasonTypeById: builder.query<ReportReasonTypeDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.reasonTypeById(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ReportReasonType', id }],
    }),

    getReportEntityTypes: builder.query<ReportableEntityTypeDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.report.entityTypes,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ReportableEntityType', id: 'LIST' }],
    }),

    getReportEntityTypeById: builder.query<ReportableEntityTypeDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.report.entityTypeById(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'ReportableEntityType', id }],
    }),

    // ==================== Subscription ====================
    getSubscriptionPacks: builder.query<SubscriptionPackDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.subscription.packs,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'SubscriptionPack', id: 'LIST' }],
    }),

    getSubscriptionPack: builder.query<SubscriptionPackDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.subscription.packById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionPack', id }],
    }),

    getSubscriptionPayments: builder.query<SubscriptionPaymentDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.subscription.payments,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'SubscriptionPayment', id: 'LIST' }],
    }),

    getSubscriptionPayment: builder.query<SubscriptionPaymentDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.subscription.paymentById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionPayment', id }],
    }),

    getSubscriptionFeatures: builder.query<SubscriptionFeatureDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.subscription.features,
        method: 'GET',
        withAuth: false,
      }),
      providesTags: [{ type: 'SubscriptionFeature', id: 'LIST' }],
    }),

    getSubscriptionFeature: builder.query<SubscriptionFeatureDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.subscription.featureById(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'SubscriptionFeature', id }],
    }),

    // ==================== Album ====================
    getAlbumShareLink: builder.query<ShareLinkDTO, number>({
      query: (albumId) => ({
        url: API_ENDPOINTS.album.shareLink(albumId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, albumId) => [{ type: 'Share', id: `album-${albumId}` }],
    }),

    // ==================== Playlist ====================
    getPlaylist: builder.query<PlaylistDTO, number>({
      query: (playlistId) => ({
        url: API_ENDPOINTS.playlist.byId(playlistId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, playlistId) => [{ type: 'Playlist', id: playlistId }],
    }),

    getPlaylistShareLink: builder.query<ShareLinkDTO, number>({
      query: (playlistId) => ({
        url: API_ENDPOINTS.playlist.shareLink(playlistId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, playlistId) => [{ type: 'Share', id: `playlist-${playlistId}` }],
    }),

    // ==================== Distribution ====================
    getDistributors: builder.query<DistributorDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.distributor.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Distributor', id: 'LIST' }],
    }),

    getDistributor: builder.query<DistributorDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributor.byId(id),
        method: 'GET',
        withAuth: false,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Distributor', id }],
    }),

    getDistributorAccount: builder.query<DistributorAccountDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.distributorMaster.getAccount(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'DistributorAccount', id }],
    }),

    getArtistRequests: builder.query<ArtistRegistrationRequestDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.distributor.request,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'ArtistRegistrationRequest', id: 'LIST' }],
    }),

    getArtistRequest: builder.query<ArtistRegistrationRequestDTO, number>({
      query: (requestId) => ({
        url: API_ENDPOINTS.distributor.requestById(requestId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, requestId) => [{ type: 'ArtistRegistrationRequest', id: requestId }],
    }),

    // ==================== Share ====================
    getShareLink: builder.query<ShareLinkDTO, { entityType: string; entityId: number }>({
      query: ({ entityType, entityId }) => ({
        url: API_ENDPOINTS.share.link(entityType, entityId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, { entityType, entityId }) => [
        { type: 'Share', id: `${entityType}-${entityId}` },
      ],
    }),

    getShareQr: builder.query<string, { entityType: string; entityId: number }>({
      query: ({ entityType, entityId }) => ({
        url: API_ENDPOINTS.share.qr(entityType, entityId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, { entityType, entityId }) => [
        { type: 'Share', id: `${entityType}-${entityId}-qr` },
      ],
    }),

    // ==================== Auth ====================
    getSessions: builder.query<ActiveSessionDTO[], void>({
      query: () => ({
        url: API_ENDPOINTS.auth.getSessions,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Session', id: 'LIST' }],
    }),
    register: builder.mutation<void, UserRegisterDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.register,
        method: 'POST',
        body: data,
        withAuth: false,
      }),
    }),
    login: builder.mutation<LoginResponseDTO, { userIdentifier: string; password: string; deviceName: string }>({
      query: ({ userIdentifier, password, deviceName }) => ({
        url: API_ENDPOINTS.auth.login,
        method: 'POST',
        params: { userIdentifier, password },
        headers: { 'X-Device-Name': deviceName },
        withAuth: false,
      }),
    }),
    verify2FA: builder.mutation<Verify2FaResponseDTO, { dto: Verify2FaDTO; deviceName: string }>({
      query: ({ dto, deviceName }) => ({
        url: API_ENDPOINTS.auth.verify2FA,
        method: 'POST',
        body: dto,
        headers: { 'X-Device-Name': deviceName },
        withAuth: true,
      }),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, string>({
      query: (token) => ({
        url: API_ENDPOINTS.auth.refreshToken,
        method: 'POST',
        body: token,
        bodyType: 'raw',
        withAuth: false,
      }),
    }),
    requestEmailChange: builder.mutation<void, string>({
      query: (email) => ({
        url: API_ENDPOINTS.auth.getMailChangeToken,
        method: 'POST',
        body: email,
        bodyType: 'raw',
        withAuth: true,
      }),
    }),
    confirmEmailChange: builder.mutation<void, ConfirmEmailChangeDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.confirmEmailChange,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
    }),
    confirmPasswordChange: builder.mutation<void, ConfirmPasswordChangeDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.auth.changePassword,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
    }),
    requestPasswordChange: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.requestPasswordChange,
        method: 'POST',
        withAuth: true,
      }),
    }),
    revokeSession: builder.mutation<void, number>({
      query: (sessionId) => ({
        url: API_ENDPOINTS.auth.revokeSession(sessionId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),
    revokeAllSessions: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.auth.revokeAllSessions,
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Session', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Music
  useGetTrackQuery,
  // User
  useGetUsersQuery,
  useGetUserByIdQuery,
  // Chat
  useGetMessageQuery,
  useGetChatInfoQuery,
  useGetChatMessagesQuery,
  // Access
  useGetAccessFeaturesQuery,
  useGetAccessFeatureByIdQuery,
  useGetUserAccessFeaturesQuery,
  // ClientSettings
  useGetClientSettingsQuery,
  // Library
  useGetFolderQuery,
  useGetFoldersQuery,
  // Gift
  useGetReceivedGiftsQuery,
  useGetSentGiftsQuery,
  useGetGiftQuery,
  useGetGiftStylesQuery,
  useGetGiftStyleByIdQuery,
  // Report
  useGetReportsQuery,
  useGetReportQuery,
  useGetReportsFilterQuery,
  useGetReportsByReporterQuery,
  useGetOpenReportsQuery,
  useGetReportReasonTypesQuery,
  useGetReportReasonTypeByIdQuery,
  useGetReportEntityTypesQuery,
  useGetReportEntityTypeByIdQuery,
  // Subscription
  useGetSubscriptionPacksQuery,
  useGetSubscriptionPackQuery,
  useGetSubscriptionPaymentsQuery,
  useGetSubscriptionPaymentQuery,
  useGetSubscriptionFeaturesQuery,
  useGetSubscriptionFeatureQuery,
  // Album
  useGetAlbumShareLinkQuery,
  // Playlist
  useGetPlaylistQuery,
  useGetPlaylistShareLinkQuery,
  // Distribution
  useGetDistributorsQuery,
  useGetDistributorQuery,
  useGetDistributorAccountQuery,
  useGetArtistRequestsQuery,
  useGetArtistRequestQuery,
  // Share
  useGetShareLinkQuery,
  useGetShareQrQuery,
  // Auth
  useGetSessionsQuery,
  useRegisterMutation,
  useLoginMutation,
  useVerify2FAMutation,
  useRefreshTokenMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useConfirmPasswordChangeMutation,
  useRequestPasswordChangeMutation,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
} = rtkApi;

