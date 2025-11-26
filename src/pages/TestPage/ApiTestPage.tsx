import React, { useState, useMemo } from 'react';

// ==================== RTK Query Hooks ====================
import {
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
} from '@shared/api/rtkApi';

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
    hookType: 'store',
    hookName: 'useUpdateTrack',
  },
  {
    id: 'deleteTrack',
    name: 'Delete Track',
    category: 'Music',
    method: 'DELETE',
    params: [{ name: 'trackId', type: 'number', required: true, placeholder: 'Track ID' }],
    hookType: 'store',
    hookName: 'useDeleteTrack',
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
    hookType: 'store',
    hookName: 'useUpdateUser',
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
    hookType: 'store',
    hookName: 'useCreateChat',
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
    hookType: 'store',
    hookName: 'useSendMessage',
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
    hookType: 'store',
    hookName: 'useCreateFolder',
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
    hookType: 'store',
    hookName: 'useRegister',
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
    hookType: 'store',
    hookName: 'useLogin',
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

  // RTK Query hooks with skip
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

  // Store hooks
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

      // RTK Query hooks - use refetch
      if (selectedEndpoint.hookType === 'rtk') {
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
            throw new Error('Endpoint not implemented');
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
