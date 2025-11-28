import React, { useState, useMemo } from 'react';

// ==================== RTK Query Hooks ====================
import {
  // Music
  useGetTrackQuery,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  useUpdateTrackVisibilityMutation,
  useToggleTrackFavoriteMutation,
  // User
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserAvatarMutation,
  useUpdateUserVisibilityMutation,
  // Chat
  useGetMessageQuery,
  useGetChatInfoQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useAddUserToChatMutation,
  useLeaveChatMutation,
  useRemoveUserFromChatMutation,
  useUpdateChatCoverMutation,
  useUpdateChatNameMutation,
  useReadMessagesMutation,
  useReadAllMessagesMutation,
  // Access
  useGetAccessFeaturesQuery,
  useGetAccessFeatureByIdQuery,
  useGetUserAccessFeaturesQuery,
  useAssignAccessFeaturesMutation,
  useRevokeAccessFeaturesMutation,
  // ClientSettings
  useGetClientSettingsQuery,
  usePatchClientSettingsMutation,
  // Library
  useGetFolderQuery,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderNameMutation,
  useDeleteFolderMutation,
  useAddCollectionToFolderMutation,
  useRemoveCollectionFromFolderMutation,
  useMoveFolderMutation,
  // Gift
  useGetReceivedGiftsQuery,
  useGetSentGiftsQuery,
  useGetGiftQuery,
  useGetGiftStylesQuery,
  useGetGiftStyleByIdQuery,
  useSendGiftMutation,
  useAcceptGiftMutation,
  useCancelGiftMutation,
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
  useCreateReportMutation,
  useDeleteReportMutation,
  useCloseReportMutation,
  // Subscription
  useGetSubscriptionPacksQuery,
  useGetSubscriptionPackQuery,
  useGetSubscriptionPaymentsQuery,
  useGetSubscriptionPaymentQuery,
  useGetSubscriptionFeaturesQuery,
  useGetSubscriptionFeatureQuery,
  usePurchaseSubscriptionMutation,
  // Album
  useGetAlbumShareLinkQuery,
  useUploadAlbumMutation,
  useDeleteAlbumMutation,
  useUpdateAlbumNameMutation,
  useAddTrackToAlbumMutation,
  useUpdateAlbumCoverMutation,
  useUpdateAlbumVisibilityMutation,
  // Playlist
  useGetPlaylistQuery,
  useGetPlaylistShareLinkQuery,
  useCreatePlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistNameMutation,
  useUpdatePlaylistCoverMutation,
  useAddContributorMutation,
  useRemoveContributorMutation,
  useAddTrackToPlaylistMutation,
  useRemoveTrackFromPlaylistMutation,
  useImportCollectionToPlaylistMutation,
  useUpdatePlaylistVisibilityMutation,
  // Distribution
  useGetDistributorsQuery,
  useGetDistributorQuery,
  useGetDistributorAccountQuery,
  useGetArtistRequestsQuery,
  useGetArtistRequestQuery,
  useCreateDistributorMutation,
  useUpdateDistributorMutation,
  useDeleteDistributorMutation,
  useUpdateDistributorKeyMutation,
  useResolveArtistRequestMutation,
  useRegisterDistributorAccountMutation,
  useDistributorLoginMutation,
  useDistributorRefreshTokenMutation,
  useTerminateDistributorSessionMutation,
  useDistributorRevokeSessionMutation,
  useDistributorRevokeAllSessionsMutation,
  useDeleteDistributorAccountMutation,
  useChangeDistributorUsernameMutation,
  useChangeDistributorEmailMutation,
  useChangeDistributorPasswordMutation,
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
  // UserState
  useUpdateCurrentPositionMutation,
  useUpdateListeningTargetMutation,
  useAddToQueueMutation,
  useDeleteFromQueueMutation,
  useUpdateUserStatusMutation,
  useUpdatePrimarySessionMutation,
  // Collection
  useUpdateCollectionVisibilityMutation,
  useToggleCollectionFavoriteMutation,
  // Blend
  useUpdateBlendVisibilityMutation,
  useToggleBlendFavoriteMutation,
  // Artist
  useRegisterArtistMutation,
  useUpdateArtistNameMutation,
  useDeleteArtistMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useUpdatePostVisibilityMutation,
} from '@shared/api';

// ==================== Music Store Hooks ====================
import {
  useTrack,
  useUpdateTrack,
  useUpdateTrackFile,
  useDeleteTrack,
  useUpdateTrackVisibility,
  useToggleTrackFavorite,
} from '@entities/Music/model/store';

// ==================== User Store Hooks ====================
import {
  useGetUsers,
  useGetUserById,
  useUpdateUser,
  useUpdateAvatar,
  useUpdateUserVisibility,
} from '@entities/User/model/store';

// ==================== Chat Store Hooks ====================
import {
  useCreateChat,
  useSendMessage,
  useDeleteMessage,
  useGetMessage,
  useGetChatInfo,
  useGetChatMessages,
  useAddUserToChat,
  useLeaveChat,
  useRemoveUserFromChat,
  useUpdateChatCover,
  useUpdateChatName,
  useReadMessages,
  useReadAllMessages,
} from '@entities/Chat/model/store';

// ==================== Album Store Hooks ====================
import {
  useUploadAlbum,
  useDeleteAlbum,
  useUpdateAlbumName,
  useAlbumAddTrack,
  useUpdateAlbumCover,
  useAlbumShareLink,
  useAlbumShareQr,
  useAlbumUpdateVisibility,
} from '@entities/Album/model/store';

// ==================== Playlist Store Hooks ====================
import {
  useCreatePlaylist,
  useDeletePlaylist,
  useUpdatePlaylistName,
  useUpdatePlaylistCover,
  useAddContributor,
  useRemoveContributor,
  useAddTrackToPlaylist,
  useRemoveTrackFromPlaylist,
  usePlaylistTracks,
  usePlaylistById,
  useImportCollectionToPlaylist,
  usePlaylistShareLink,
  usePlaylistShareQr,
  usePlaylistUpdateVisibility,
} from '@entities/Playlist/model/store';

// ==================== Report Store Hooks ====================
import {
  useReports,
  useReport,
  useCreateReport,
  useDeleteReport,
  useCloseReport,
  useFilteredReports,
  useReportsByReporter,
  useOpenReports,
  useReportReasonTypes,
  useReportReasonType,
  useReportableEntityTypes,
  useReportableEntityType,
} from '@entities/Report/model/store';

// ==================== Subscription Store Hooks ====================
import {
  useSubscriptionPacks,
  useSubscriptionPack,
  useSubscriptionFeatures,
  useSubscriptionFeature,
  useSubscriptionPayments,
  useSubscriptionPayment,
  usePurchaseSubscription,
} from '@entities/Subscription/model/store';

// ==================== Gift Store Hooks ====================
import {
  useSendGift,
  useAcceptGift,
  useGetReceivedGifts,
  useGetSentGifts,
  useGetGift,
  useCancelGift,
  useGetGiftStyles,
  useGetGiftStyle,
} from '@entities/Gift/model/store';

// ==================== Library Store Hooks ====================
import {
  useGetFolder,
  useGetAllFolders,
  useCreateFolder,
  useUpdateFolderName,
  useDeleteFolder,
  useAddCollectionToFolder,
  useRemoveCollectionFromFolder,
  useMoveFolder,
} from '@entities/Library/model/store';

// ==================== Auth Store Hooks ====================
import {
  useRegister,
  useLogin,
} from '@features/auth/model/store';

// ==================== Access Store Hooks ====================
import {
  useAccessFeatures,
  useAccessFeatureById,
  useUserAccessFeatures,
  useAssignAccessFeatures,
  useRevokeAccessFeatures,
} from '@entities/Access/model/store';

// ==================== ClientSettings Store Hooks ====================
import {
  useGetClientSettings,
  usePatchClientSettings,
} from '@entities/ClientSettings/model/store';

// ==================== UserState Store Hooks ====================
import {
  useUpdateCurrentPosition,
  useUpdateListeningTarget,
  useAddToQueue,
  useDeleteFromQueue,
  useUpdateUserStatus,
  useUpdateUserPrimarySession,
} from '@entities/UserState/model/store';

// ==================== Auth Store Hooks ====================
import {
  useVerify2FA,
  useRefreshToken,
  useRequestEmailChange,
  useConfirmEmailChange,
  useConfirmPasswordChange,
  useRequestPasswordChange,
  useSessions,
} from '@features/auth/model/store';

// ==================== Collection Store Hooks ====================
import {
  useUpdateCollectionVisibility,
  useToggleCollectionFavorite,
} from '@entities/Collection/model/store';

// ==================== Distribution Store Hooks ====================
import {
  useCreateDistributor,
  useGetDistributors,
  useGetDistributor,
  useUpdateDistributor,
  useDeleteDistributor,
  useUpdateDistributorKey,
  useGetArtistRequests,
  useGetArtistRequest,
  useResolveArtistRequest,
  useTerminateDistributorSession,
  useRegisterDistributorAccount,
  useDistributorLogin,
  useDistributorRefreshToken,
  useDistributorRevokeSession,
  useDistributorRevokeAllSessions,
  useGetDistributorSessions,
  useDeleteDistributorAccount,
  useChangeDistributorUsername,
  useGetDistributorAccount,
  useChangeDistributorEmail,
  useChangeDistributorPassword,
} from '@entities/Distribution/model/store';

// ==================== Artist Store Hooks ====================
import {
  useRegisterArtist,
  useUpdateArtistName,
  useDeleteArtist,
  useCreatePost,
  useDeletePost,
  useUpdatePost,
  useUpdatePostVisibility,
} from '@entities/Artist/model/store';

// ==================== Blend Store Hooks ====================
import {
  useUpdateBlendVisibility,
  useToggleBlendFavorite,
} from '@entities/Blend/model/store';

// ==================== Share Store Hooks ====================
import {
  useGetShareLink,
  useGetShareQr,
} from '@entities/Share/model/store';

// ==================== Shared Store Hooks ====================
// Note: These hooks are imported but not used in the test page
// import { useAuth } from '@shared/lib/auth/useAuth';
// import { useClientSettings } from '@shared/store/features/clientSettings/useClientSettings';
// import { useUserState } from '@shared/store/features/userState/useUserState';
// import { useAccess } from '@shared/store/features/access/useAccess';

// ==================== Types ====================
type ParamType = 'number' | 'string' | 'boolean' | 'file' | 'json' | 'array';

interface EndpointParam {
  name: string;
  type: ParamType;
  required?: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
}

interface EndpointDefinition {
  id: string;
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params: EndpointParam[];
  hookType: 'rtk' | 'store';
  hookName: string;
}

// ==================== Endpoint Definitions ====================
const ENDPOINTS: EndpointDefinition[] = [
  // Music
  {
    id: 'getTrack',
    name: 'Get Track',
    category: 'Music',
    method: 'GET',
    params: [{ name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' }],
    hookType: 'rtk',
    hookName: 'useGetTrackQuery',
  },
  {
    id: 'updateTrack',
    name: 'Update Track',
    category: 'Music',
    method: 'PUT',
    params: [
      { name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' },
      { name: 'body', type: 'json', required: true, placeholder: '{"title": "New Title"}' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateTrackMutation',
  },
  {
    id: 'deleteTrack',
    name: 'Delete Track',
    category: 'Music',
    method: 'DELETE',
    params: [{ name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' }],
    hookType: 'rtk',
    hookName: 'useDeleteTrackMutation',
  },
  {
    id: 'updateTrackVisibility',
    name: 'Update Track Visibility',
    category: 'Music',
    method: 'PUT',
    params: [
      { name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' },
      { name: 'visibilityStatusId', type: 'number', required: true, placeholder: 'Visibility Status ID' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateTrackVisibilityMutation',
  },
  {
    id: 'toggleTrackFavorite',
    name: 'Toggle Track Favorite',
    category: 'Music',
    method: 'POST',
    params: [{ name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' }],
    hookType: 'rtk',
    hookName: 'useToggleTrackFavoriteMutation',
  },
  // User
  {
    id: 'getUsers',
    name: 'Get Users',
    category: 'User',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetUsersQuery',
  },
  {
    id: 'getUserById',
    name: 'Get User By ID',
    category: 'User',
    method: 'GET',
    params: [{ name: 'userId', type: 'number', required: true, placeholder: 'User ID' }],
    hookType: 'rtk',
    hookName: 'useGetUserByIdQuery',
  },
  {
    id: 'updateUser',
    name: 'Update User',
    category: 'User',
    method: 'PUT',
    params: [
      { name: 'body', type: 'json', required: true, placeholder: '{"userName": "newName"}' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateUserMutation',
  },
  {
    id: 'updateUserAvatar',
    name: 'Update User Avatar',
    category: 'User',
    method: 'POST',
    params: [
      { name: 'file', type: 'file', required: true, placeholder: 'Avatar file' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateUserAvatarMutation',
  },
  {
    id: 'updateUserVisibility',
    name: 'Update User Visibility',
    category: 'User',
    method: 'PUT',
    params: [
      { name: 'collectionId', type: 'number', required: true, placeholder: 'Collection ID' },
      { name: 'visibilityStatusId', type: 'number', required: true, placeholder: 'Visibility Status ID' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateUserVisibilityMutation',
  },
  // Chat
  {
    id: 'getMessage',
    name: 'Get Message',
    category: 'Chat',
    method: 'GET',
    params: [{ name: 'messageId', type: 'number', required: true, placeholder: 'Message ID' }],
    hookType: 'rtk',
    hookName: 'useGetMessageQuery',
  },
  {
    id: 'getChatInfo',
    name: 'Get Chat Info',
    category: 'Chat',
    method: 'GET',
    params: [{ name: 'chatId', type: 'number', required: true, placeholder: 'Chat ID' }],
    hookType: 'rtk',
    hookName: 'useGetChatInfoQuery',
  },
  {
    id: 'createChat',
    name: 'Create Chat',
    category: 'Chat',
    method: 'POST',
    params: [
      { name: 'body', type: 'json', required: true, placeholder: '{"name": "Chat Name"}' },
    ],
    hookType: 'rtk',
    hookName: 'useCreateChatMutation',
  },
  {
    id: 'sendMessage',
    name: 'Send Message',
    category: 'Chat',
    method: 'POST',
    params: [
      { name: 'chatId', type: 'number', required: true, placeholder: 'Chat ID' },
      { name: 'body', type: 'json', required: true, placeholder: '{"text": "Message text"}' },
    ],
    hookType: 'rtk',
    hookName: 'useSendMessageMutation',
  },
  {
    id: 'deleteMessage',
    name: 'Delete Message',
    category: 'Chat',
    method: 'DELETE',
    params: [{ name: 'messageId', type: 'number', required: true, placeholder: 'Message ID' }],
    hookType: 'rtk',
    hookName: 'useDeleteMessageMutation',
  },
  {
    id: 'addUserToChat',
    name: 'Add User to Chat',
    category: 'Chat',
    method: 'POST',
    params: [
      { name: 'chatId', type: 'number', required: true, placeholder: 'Chat ID' },
      { name: 'userId', type: 'number', required: true, placeholder: 'User ID' },
    ],
    hookType: 'rtk',
    hookName: 'useAddUserToChatMutation',
  },
  {
    id: 'leaveChat',
    name: 'Leave Chat',
    category: 'Chat',
    method: 'DELETE',
    params: [{ name: 'chatId', type: 'number', required: true, placeholder: 'Chat ID' }],
    hookType: 'rtk',
    hookName: 'useLeaveChatMutation',
  },
  // Library
  {
    id: 'getFolder',
    name: 'Get Folder',
    category: 'Library',
    method: 'GET',
    params: [{ name: 'folderId', type: 'number', required: true, placeholder: 'Folder ID' }],
    hookType: 'rtk',
    hookName: 'useGetFolderQuery',
  },
  {
    id: 'getFolders',
    name: 'Get All Folders',
    category: 'Library',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetFoldersQuery',
  },
  {
    id: 'createFolder',
    name: 'Create Folder',
    category: 'Library',
    method: 'POST',
    params: [
      { name: 'body', type: 'json', required: true, placeholder: '{"name": "Folder Name"}' },
    ],
    hookType: 'rtk',
    hookName: 'useCreateFolderMutation',
  },
  {
    id: 'updateFolderName',
    name: 'Update Folder Name',
    category: 'Library',
    method: 'PUT',
    params: [
      { name: 'folderId', type: 'number', required: true, placeholder: 'Folder ID' },
      { name: 'newName', type: 'string', required: true, placeholder: 'New folder name' },
    ],
    hookType: 'rtk',
    hookName: 'useUpdateFolderNameMutation',
  },
  {
    id: 'deleteFolder',
    name: 'Delete Folder',
    category: 'Library',
    method: 'DELETE',
    params: [{ name: 'folderId', type: 'number', required: true, placeholder: 'Folder ID' }],
    hookType: 'rtk',
    hookName: 'useDeleteFolderMutation',
  },
  // Gift
  {
    id: 'getReceivedGifts',
    name: 'Get Received Gifts',
    category: 'Gift',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetReceivedGiftsQuery',
  },
  {
    id: 'getGift',
    name: 'Get Gift',
    category: 'Gift',
    method: 'GET',
    params: [{ name: 'id', type: 'number', required: true, placeholder: 'Gift ID' }],
    hookType: 'rtk',
    hookName: 'useGetGiftQuery',
  },
  // Report
  {
    id: 'getReports',
    name: 'Get Reports',
    category: 'Report',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetReportsQuery',
  },
  {
    id: 'getReport',
    name: 'Get Report',
    category: 'Report',
    method: 'GET',
    params: [{ name: 'id', type: 'number', required: true, placeholder: 'Report ID' }],
    hookType: 'rtk',
    hookName: 'useGetReportQuery',
  },
  // Subscription
  {
    id: 'getSubscriptionPacks',
    name: 'Get Subscription Packs',
    category: 'Subscription',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetSubscriptionPacksQuery',
  },
  // Auth
  {
    id: 'register',
    name: 'Register',
    category: 'Auth',
    method: 'POST',
    params: [
      {
        name: 'body',
        type: 'json',
        required: true,
        placeholder: '{"userName": "testuser", "login": "testuser", "email": "test@example.com", "password": "Password123!", "firstName": "Test", "lastName": "User", "dateOfBirth": "2000-01-01", "locale": "en-US"}',
      },
    ],
    hookType: 'rtk',
    hookName: 'useRegisterMutation',
  },
  {
    id: 'login',
    name: 'Login',
    category: 'Auth',
    method: 'POST',
    params: [
      { name: 'userIdentifier', type: 'string', required: true, placeholder: 'Username or email' },
      { name: 'password', type: 'string', required: true, placeholder: 'Password' },
      { name: 'deviceName', type: 'string', required: true, placeholder: 'Device name (e.g., "Chrome Browser")' },
    ],
    hookType: 'rtk',
    hookName: 'useLoginMutation',
  },
  {
    id: 'getSessions',
    name: 'Get Sessions',
    category: 'Auth',
    method: 'GET',
    params: [],
    hookType: 'rtk',
    hookName: 'useGetSessionsQuery',
  },
];

// ==================== Component ====================
export const ApiTestPage: React.FC = () => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEndpoint = useMemo(
    () => ENDPOINTS.find((ep) => ep.id === selectedEndpointId),
    [selectedEndpointId]
  );

  const categories = useMemo(() => {
    const cats = new Set(ENDPOINTS.map((ep) => ep.category));
    return Array.from(cats).sort();
  }, []);

  const handleParamChange = (paramName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleEndpointChange = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    setFormData({});
    setResponse(null);
    setError(null);
  };

  // RTK Query query hooks with skip
  const shouldSkip = (endpointId: string) => selectedEndpoint?.id !== endpointId;
  const getTrack = useGetTrackQuery(formData.trackId || 0, { skip: shouldSkip('getTrack') || !formData.trackId });
  const getUsers = useGetUsersQuery(undefined, { skip: shouldSkip('getUsers') });
  const getUserById = useGetUserByIdQuery(formData.userId || 0, { skip: shouldSkip('getUserById') || !formData.userId });
  const getMessage = useGetMessageQuery(formData.messageId || 0, { skip: shouldSkip('getMessage') || !formData.messageId });
  const getChatInfo = useGetChatInfoQuery(formData.chatId || 0, { skip: shouldSkip('getChatInfo') || !formData.chatId });
  const getFolder = useGetFolderQuery(formData.folderId || 0, { skip: shouldSkip('getFolder') || !formData.folderId });
  const getFolders = useGetFoldersQuery(undefined, { skip: shouldSkip('getFolders') });
  const getReceivedGifts = useGetReceivedGiftsQuery(undefined, { skip: shouldSkip('getReceivedGifts') });
  const getGift = useGetGiftQuery(formData.id || 0, { skip: shouldSkip('getGift') || !formData.id });
  const getReports = useGetReportsQuery(undefined, { skip: shouldSkip('getReports') });
  const getReport = useGetReportQuery(formData.id || 0, { skip: shouldSkip('getReport') || !formData.id });
  const getSubscriptionPacks = useGetSubscriptionPacksQuery(undefined, { skip: shouldSkip('getSubscriptionPacks') });
  const getSessions = useGetSessionsQuery(undefined, { skip: shouldSkip('getSessions') });

  // RTK Query mutation hooks
  const [updateTrack] = useUpdateTrackMutation();
  const [deleteTrack] = useDeleteTrackMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createChat] = useCreateChatMutation();
  const [sendMessage] = useSendMessageMutation();
  const [createFolder] = useCreateFolderMutation();
  const [register] = useRegisterMutation();
  const [login] = useLoginMutation();
  const [updateTrackVisibility] = useUpdateTrackVisibilityMutation();
  const [toggleTrackFavorite] = useToggleTrackFavoriteMutation();
  const [updateUserAvatar] = useUpdateUserAvatarMutation();
  const [updateUserVisibility] = useUpdateUserVisibilityMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [addUserToChat] = useAddUserToChatMutation();
  const [leaveChat] = useLeaveChatMutation();
  const [removeUserFromChat] = useRemoveUserFromChatMutation();
  const [updateChatCover] = useUpdateChatCoverMutation();
  const [updateChatName] = useUpdateChatNameMutation();
  const [readMessages] = useReadMessagesMutation();
  const [readAllMessages] = useReadAllMessagesMutation();
  const [assignAccessFeatures] = useAssignAccessFeaturesMutation();
  const [revokeAccessFeatures] = useRevokeAccessFeaturesMutation();
  const [patchClientSettings] = usePatchClientSettingsMutation();
  const [updateFolderName] = useUpdateFolderNameMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [addCollectionToFolder] = useAddCollectionToFolderMutation();
  const [removeCollectionFromFolder] = useRemoveCollectionFromFolderMutation();
  const [moveFolder] = useMoveFolderMutation();
  const [sendGift] = useSendGiftMutation();
  const [acceptGift] = useAcceptGiftMutation();
  const [cancelGift] = useCancelGiftMutation();
  const [createReport] = useCreateReportMutation();
  const [deleteReport] = useDeleteReportMutation();
  const [closeReport] = useCloseReportMutation();
  const [purchaseSubscription] = usePurchaseSubscriptionMutation();
  const [uploadAlbum] = useUploadAlbumMutation();
  const [deleteAlbum] = useDeleteAlbumMutation();
  const [updateAlbumName] = useUpdateAlbumNameMutation();
  const [addTrackToAlbum] = useAddTrackToAlbumMutation();
  const [updateAlbumCover] = useUpdateAlbumCoverMutation();
  const [updateAlbumVisibility] = useUpdateAlbumVisibilityMutation();
  const [createPlaylist] = useCreatePlaylistMutation();
  const [deletePlaylist] = useDeletePlaylistMutation();
  const [updatePlaylistName] = useUpdatePlaylistNameMutation();
  const [updatePlaylistCover] = useUpdatePlaylistCoverMutation();
  const [addContributor] = useAddContributorMutation();
  const [removeContributor] = useRemoveContributorMutation();
  const [addTrackToPlaylist] = useAddTrackToPlaylistMutation();
  const [removeTrackFromPlaylist] = useRemoveTrackFromPlaylistMutation();
  const [importCollectionToPlaylist] = useImportCollectionToPlaylistMutation();
  const [updatePlaylistVisibility] = useUpdatePlaylistVisibilityMutation();
  const [updateCurrentPosition] = useUpdateCurrentPositionMutation();
  const [updateListeningTarget] = useUpdateListeningTargetMutation();
  const [addToQueue] = useAddToQueueMutation();
  const [deleteFromQueue] = useDeleteFromQueueMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updatePrimarySession] = useUpdatePrimarySessionMutation();
  const [updateCollectionVisibility] = useUpdateCollectionVisibilityMutation();
  const [toggleCollectionFavorite] = useToggleCollectionFavoriteMutation();
  const [updateBlendVisibility] = useUpdateBlendVisibilityMutation();
  const [toggleBlendFavorite] = useToggleBlendFavoriteMutation();
  const [registerArtist] = useRegisterArtistMutation();
  const [updateArtistName] = useUpdateArtistNameMutation();
  const [deleteArtist] = useDeleteArtistMutation();
  const [createPost] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [updatePostVisibility] = useUpdatePostVisibilityMutation();

  // Store hooks (legacy)
  const updateTrackHook = useUpdateTrack();
  const deleteTrackHook = useDeleteTrack();
  const updateUserHook = useUpdateUser();
  const createChatHook = useCreateChat();
  const sendMessageHook = useSendMessage();
  const createFolderHook = useCreateFolder();
  const registerHook = useRegister();
  const loginHook = useLogin();

  const handleSubmit = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let result: any;

      // RTK Query hooks
      if (selectedEndpoint.hookType === 'rtk') {
        // RTK Query queries - use refetch
        if (selectedEndpoint.hookName.includes('Query')) {
          switch (selectedEndpoint.id) {
            case 'getTrack':
              const trackResult = await getTrack.refetch();
              result = trackResult.data ? { success: true, data: trackResult.data } : { success: false, error: trackResult.error };
              break;
            case 'getUsers':
              const usersResult = await getUsers.refetch();
              result = usersResult.data ? { success: true, data: usersResult.data } : { success: false, error: usersResult.error };
              break;
            case 'getUserById':
              const userResult = await getUserById.refetch();
              result = userResult.data ? { success: true, data: userResult.data } : { success: false, error: userResult.error };
              break;
            case 'getMessage':
              const messageResult = await getMessage.refetch();
              result = messageResult.data ? { success: true, data: messageResult.data } : { success: false, error: messageResult.error };
              break;
            case 'getChatInfo':
              const chatInfoResult = await getChatInfo.refetch();
              result = chatInfoResult.data ? { success: true, data: chatInfoResult.data } : { success: false, error: chatInfoResult.error };
              break;
            case 'getFolder':
              const folderResult = await getFolder.refetch();
              result = folderResult.data ? { success: true, data: folderResult.data } : { success: false, error: folderResult.error };
              break;
            case 'getFolders':
              const foldersResult = await getFolders.refetch();
              result = foldersResult.data ? { success: true, data: foldersResult.data } : { success: false, error: foldersResult.error };
              break;
            case 'getReceivedGifts':
              const giftsResult = await getReceivedGifts.refetch();
              result = giftsResult.data ? { success: true, data: giftsResult.data } : { success: false, error: giftsResult.error };
              break;
            case 'getGift':
              const giftResult = await getGift.refetch();
              result = giftResult.data ? { success: true, data: giftResult.data } : { success: false, error: giftResult.error };
              break;
            case 'getReports':
              const reportsResult = await getReports.refetch();
              result = reportsResult.data ? { success: true, data: reportsResult.data } : { success: false, error: reportsResult.error };
              break;
            case 'getReport':
              const reportResult = await getReport.refetch();
              result = reportResult.data ? { success: true, data: reportResult.data } : { success: false, error: reportResult.error };
              break;
            case 'getSubscriptionPacks':
              const packsResult = await getSubscriptionPacks.refetch();
              result = packsResult.data ? { success: true, data: packsResult.data } : { success: false, error: packsResult.error };
              break;
            case 'getSessions':
              const sessionsResult = await getSessions.refetch();
              result = sessionsResult.data ? { success: true, data: sessionsResult.data } : { success: false, error: sessionsResult.error };
              break;
            default:
              throw new Error(`Query endpoint "${selectedEndpoint.id}" not implemented`);
          }
        } else {
          // RTK Query mutations - use trigger
          try {
            let mutationResult: any;
            switch (selectedEndpoint.id) {
              // Music mutations
              case 'updateTrack':
                mutationResult = await updateTrack({ trackId: formData.trackId, body: formData.body }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deleteTrack':
                await deleteTrack(formData.trackId).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateTrackVisibility':
                await updateTrackVisibility({ trackId: formData.trackId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'toggleTrackFavorite':
                await toggleTrackFavorite(formData.trackId).unwrap();
                result = { success: true, data: null };
                break;
              // User mutations
              case 'updateUser':
                mutationResult = await updateUser(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'updateUserAvatar':
                await updateUserAvatar(formData.file).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateUserVisibility':
                await updateUserVisibility({ collectionId: formData.collectionId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              // Chat mutations
              case 'createChat':
                mutationResult = await createChat(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'sendMessage':
                mutationResult = await sendMessage({ chatId: formData.chatId, body: formData.body }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deleteMessage':
                await deleteMessage(formData.messageId).unwrap();
                result = { success: true, data: null };
                break;
              case 'addUserToChat':
                await addUserToChat({ chatId: formData.chatId, userId: formData.userId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'leaveChat':
                await leaveChat(formData.chatId).unwrap();
                result = { success: true, data: null };
                break;
              case 'removeUserFromChat':
                await removeUserFromChat({ chatId: formData.chatId, userId: formData.userId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateChatCover':
                await updateChatCover({ chatId: formData.chatId, file: formData.file }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateChatName':
                await updateChatName({ chatId: formData.chatId, name: formData.name }).unwrap();
                result = { success: true, data: null };
                break;
              case 'readMessages':
                await readMessages({ chatId: formData.chatId, messageIds: formData.messageIds }).unwrap();
                result = { success: true, data: null };
                break;
              case 'readAllMessages':
                await readAllMessages(formData.chatId).unwrap();
                result = { success: true, data: null };
                break;
              // Access mutations
              case 'assignAccessFeatures':
                await assignAccessFeatures({ userId: formData.userId, accessFeatureIds: formData.accessFeatureIds }).unwrap();
                result = { success: true, data: null };
                break;
              case 'revokeAccessFeatures':
                await revokeAccessFeatures({ userId: formData.userId, accessFeatureIds: formData.accessFeatureIds }).unwrap();
                result = { success: true, data: null };
                break;
              // ClientSettings mutations
              case 'patchClientSettings':
                mutationResult = await patchClientSettings(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              // Library mutations
              case 'createFolder':
                mutationResult = await createFolder(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'updateFolderName':
                mutationResult = await updateFolderName({ folderId: formData.folderId, newName: formData.newName }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deleteFolder':
                await deleteFolder(formData.folderId).unwrap();
                result = { success: true, data: null };
                break;
              case 'addCollectionToFolder':
                await addCollectionToFolder({ folderId: formData.folderId, collectionId: formData.collectionId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'removeCollectionFromFolder':
                await removeCollectionFromFolder({ folderId: formData.folderId, collectionId: formData.collectionId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'moveFolder':
                await moveFolder({ folderId: formData.folderId, newParentId: formData.newParentId }).unwrap();
                result = { success: true, data: null };
                break;
              // Gift mutations
              case 'sendGift':
                mutationResult = await sendGift(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'acceptGift':
                await acceptGift(formData.giftId).unwrap();
                result = { success: true, data: null };
                break;
              case 'cancelGift':
                await cancelGift(formData.giftId).unwrap();
                result = { success: true, data: null };
                break;
              // Report mutations
              case 'createReport':
                mutationResult = await createReport(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deleteReport':
                await deleteReport(formData.id).unwrap();
                result = { success: true, data: null };
                break;
              case 'closeReport':
                await closeReport(formData.id).unwrap();
                result = { success: true, data: null };
                break;
              // Subscription mutations
              case 'purchaseSubscription':
                mutationResult = await purchaseSubscription(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              // Album mutations
              case 'uploadAlbum':
                mutationResult = await uploadAlbum(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deleteAlbum':
                await deleteAlbum(formData.albumId).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateAlbumName':
                mutationResult = await updateAlbumName({ albumId: formData.albumId, newName: formData.newName }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'addTrackToAlbum':
                await addTrackToAlbum({ albumId: formData.albumId, body: formData.body }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateAlbumCover':
                await updateAlbumCover({ albumId: formData.albumId, file: formData.file }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateAlbumVisibility':
                await updateAlbumVisibility({ albumId: formData.albumId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              // Playlist mutations
              case 'createPlaylist':
                mutationResult = await createPlaylist(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deletePlaylist':
                await deletePlaylist(formData.playlistId).unwrap();
                result = { success: true, data: null };
                break;
              case 'updatePlaylistName':
                mutationResult = await updatePlaylistName({ playlistId: formData.playlistId, newName: formData.newName }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'updatePlaylistCover':
                await updatePlaylistCover({ playlistId: formData.playlistId, file: formData.file }).unwrap();
                result = { success: true, data: null };
                break;
              case 'addContributor':
                await addContributor({ playlistId: formData.playlistId, userId: formData.userId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'removeContributor':
                await removeContributor({ playlistId: formData.playlistId, userId: formData.userId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'addTrackToPlaylist':
                await addTrackToPlaylist({ playlistId: formData.playlistId, trackId: formData.trackId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'removeTrackFromPlaylist':
                await removeTrackFromPlaylist({ playlistId: formData.playlistId, trackId: formData.trackId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'importCollectionToPlaylist':
                await importCollectionToPlaylist({ playlistId: formData.playlistId, collectionId: formData.collectionId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updatePlaylistVisibility':
                await updatePlaylistVisibility({ playlistId: formData.playlistId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              // UserState mutations
              case 'updateCurrentPosition':
                await updateCurrentPosition(formData.position).unwrap();
                result = { success: true, data: null };
                break;
              case 'updateListeningTarget':
                await updateListeningTarget({ trackId: formData.trackId, collectionId: formData.collectionId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'addToQueue':
                await addToQueue().unwrap();
                result = { success: true, data: null };
                break;
              case 'deleteFromQueue':
                await deleteFromQueue().unwrap();
                result = { success: true, data: null };
                break;
              case 'updateUserStatus':
                await updateUserStatus(formData.statusId).unwrap();
                result = { success: true, data: null };
                break;
              case 'updatePrimarySession':
                await updatePrimarySession().unwrap();
                result = { success: true, data: null };
                break;
              // Collection mutations
              case 'updateCollectionVisibility':
                await updateCollectionVisibility({ collectionId: formData.collectionId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'toggleCollectionFavorite':
                await toggleCollectionFavorite(formData.collectionId).unwrap();
                result = { success: true, data: null };
                break;
              // Blend mutations
              case 'updateBlendVisibility':
                await updateBlendVisibility({ blendId: formData.blendId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'toggleBlendFavorite':
                await toggleBlendFavorite(formData.blendId).unwrap();
                result = { success: true, data: null };
                break;
              // Artist mutations
              case 'registerArtist':
                mutationResult = await registerArtist(formData.body).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'updateArtistName':
                await updateArtistName({ artistId: formData.artistId, newName: formData.newName }).unwrap();
                result = { success: true, data: null };
                break;
              case 'deleteArtist':
                await deleteArtist(formData.artistId).unwrap();
                result = { success: true, data: null };
                break;
              case 'createPost':
                mutationResult = await createPost({ artistId: formData.artistId, body: formData.body }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'deletePost':
                await deletePost({ artistId: formData.artistId, postId: formData.postId }).unwrap();
                result = { success: true, data: null };
                break;
              case 'updatePost':
                mutationResult = await updatePost({ artistId: formData.artistId, postId: formData.postId, body: formData.body }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              case 'updatePostVisibility':
                await updatePostVisibility({ artistId: formData.artistId, postId: formData.postId, visibilityStatusId: formData.visibilityStatusId }).unwrap();
                result = { success: true, data: null };
                break;
              // Auth mutations
              case 'register':
                await register(formData.body).unwrap();
                result = { success: true, data: null };
                break;
              case 'login':
                mutationResult = await login({ userIdentifier: formData.userIdentifier, password: formData.password, deviceName: formData.deviceName }).unwrap();
                result = { success: true, data: mutationResult };
                break;
              default:
                throw new Error(`Mutation endpoint "${selectedEndpoint.id}" not implemented`);
            }
          } catch (err: any) {
            result = {
              success: false,
              error: err?.data || err?.message || err,
            };
          }
        }
      } else {
        // Store hooks
        switch (selectedEndpoint.id) {
          case 'updateTrack':
            result = await updateTrackHook.mutate(formData.trackId, formData.body);
            break;
          case 'deleteTrack':
            result = await deleteTrackHook.mutate(formData.trackId);
            break;
          case 'updateUser':
            result = await updateUserHook.mutate(formData.body);
            break;
          case 'createChat':
            result = await createChatHook.mutate(formData.body);
            break;
          case 'sendMessage':
            result = await sendMessageHook.mutate(formData.chatId, formData.body);
            break;
          case 'createFolder':
            result = await createFolderHook.mutate(formData.body);
            break;
          case 'register':
            result = await registerHook.mutate(formData.body);
            break;
          case 'login':
            result = await loginHook.mutate(
              formData.userIdentifier,
              formData.password,
              formData.deviceName
            );
            break;
          default:
            throw new Error('Endpoint not implemented');
        }
      }

      if (result?.error) {
        throw result.error;
      }

      setResponse(result);
    } catch (err: any) {
      setError(err?.message || err?.data?.message || JSON.stringify(err) || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const renderParamInput = (param: EndpointParam) => {
    const value = formData[param.name] ?? param.defaultValue ?? '';

    switch (param.type) {
      case 'number':
        return (
          <input
            key={param.name}
            type="number"
            value={value}
            onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
            placeholder={param.placeholder || param.name}
            required={param.required}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        );
      case 'boolean':
        return (
          <input
            key={param.name}
            type="checkbox"
            checked={value}
            onChange={(e) => handleParamChange(param.name, e.target.checked)}
            style={{ marginTop: '4px' }}
          />
        );
      case 'file':
        return (
          <input
            key={param.name}
            type="file"
            onChange={(e) => handleParamChange(param.name, e.target.files?.[0])}
            required={param.required}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
            }}
          />
        );
      case 'json':
        return (
          <textarea
            key={param.name}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParamChange(param.name, parsed);
              } catch {
                handleParamChange(param.name, e.target.value);
              }
            }}
            placeholder={param.placeholder || '{}'}
            required={param.required}
            rows={6}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          />
        );
      case 'array':
        return (
          <textarea
            key={param.name}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => {
              const arrayValue = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
              handleParamChange(param.name, arrayValue);
            }}
            placeholder={param.placeholder || 'item1, item2, item3'}
            required={param.required}
            rows={3}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        );
      default:
        return (
          <input
            key={param.name}
            type="text"
            value={value}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            placeholder={param.placeholder || param.name}
            required={param.required}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        );
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#333' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>API Test Page</h1>

      {/* Endpoint Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Select Endpoint:
        </label>
        <select
          value={selectedEndpointId}
          onChange={(e) => handleEndpointChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
        >
          <option value="">-- Select an endpoint --</option>
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {ENDPOINTS.filter((ep) => ep.category === category).map((ep) => (
                <option key={ep.id} value={ep.id}>
                  [{ep.method}] {ep.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Form */}
      {selectedEndpoint && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
            {selectedEndpoint.name}
          </h2>
          <div style={{ marginBottom: '12px', color: '#333' }}>
            <strong>Method:</strong> {selectedEndpoint.method} |{' '}
            <strong>Hook:</strong> {selectedEndpoint.hookName} ({selectedEndpoint.hookType})
          </div>

          {selectedEndpoint.params.length > 0 ? (
            <div>
              {selectedEndpoint.params.map((param) => (
                <div key={param.name} style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontWeight: '500',
                      color: '#333',
                    }}
                  >
                    {param.name}
                    {param.required && <span style={{ color: 'red' }}> *</span>}
                    {param.description && (
                      <span style={{ color: '#333', fontSize: '12px', marginLeft: '8px' }}>
                        ({param.description})
                      </span>
                    )}
                  </label>
                  {renderParamInput(param)}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#333', fontStyle: 'italic' }}>
              This endpoint doesn't require any parameters.
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Execute Request'}
          </button>
        </div>
      )}

      {/* Response */}
      {(response || error) && (
        <div
          style={{
            border: `1px solid ${error ? '#dc3545' : '#28a745'}`,
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: error ? '#f8d7da' : '#d4edda',
          }}
        >
          <h3 style={{ marginTop: 0, color: error ? '#721c24' : '#155724' }}>
            {error ? 'Error' : 'Response'}
          </h3>
          <pre
            style={{
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '14px',
            }}
          >
            {JSON.stringify(error || response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
